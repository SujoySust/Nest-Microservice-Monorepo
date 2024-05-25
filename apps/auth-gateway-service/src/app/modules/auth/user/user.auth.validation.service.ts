import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Request } from 'express';

import { CodeVerifyInputs } from '../../../models/custom/common.input.model';
import { UserActivityService } from '../../activity/user_activity.service';

import { isIn } from 'class-validator';
import {
  PasswordResetInput,
  SendForgotPasswordOtpInput,
  SignupInput,
  UserLoginInput,
  VerifyAuthCodeInput,
} from './dto/input.dto';
import { F_AuthValidationInterface } from './dto/interfaces';
import { __ } from '@squareboat/nestjs-localization';
import { PasswordService } from '../../../../lib/auth/password.service';
import {
  SERIVCE_URL,
  VERIFICATION_CODE_EVENT,
  VERIFICATION_CODE_METHOD,
  COMMON_STATUS,
  USER_STATUS,
  ACTIVITY_EVENT,
  ACTIVITY,
  USER_TYPE,
} from '../../../helpers/core_constant';
import {
  errorResponse,
  processException,
  postgres_client,
} from '../../../helpers/core_function';
import { User } from '../../../models/db/user.model';

@Injectable()
export class F_AuthValidationService implements F_AuthValidationInterface {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly activityService: UserActivityService,
  ) {}

  // Validate user singup
  async validateSignup(payload: SignupInput) {
    try {
      if (!payload.email && !payload.phone) {
        throw new BadRequestException(
          errorResponse(__('Email or phone is required!')),
        );
      }

      // TODO: Send otp validation

      // if (payload.phone) {
      //   const res = await sendHttpPostRequest(
      //     SERIVCE_URL.NOTIFICATION_SERVICE,
      //     'otp/validate/phone',
      //     {
      //       phone: payload.phone,
      //     },
      //   );
      //   if (!res.success) {
      //     throw new BadRequestException(
      //       errorResponse(__('Phone validation failed!')),
      //     );
      //   }
      //   payload.phone = res?.data?.phone;
      // }

      return payload;
    } catch (e) {
      processException(e);
    }
  }

  // Validate user login
  async validateLogin(
    payload: UserLoginInput,
    req: Request,
  ): Promise<{
    user: User;
    deviceToken: string;
  }> {
    try {
      const deviceToken = req.header('dvctk');
      const email = payload.email || undefined;
      const phone = payload.phone || undefined;
      const user = await postgres_client.user.findFirst({
        where: { OR: [{ email: email }, { phone: phone }] },
      });

      if (!user) {
        throw new NotFoundException(errorResponse(__('User not found!')));
      }

      await this.checkPasswordValidity(payload, user);

      return {
        user,
        deviceToken,
      };
    } catch (e) {
      processException(e);
    }
  }

  // Validate send auth verification code
  async validateSendAuthVerificationCode(
    usercode: string,
    method: number,
    event: number,
  ): Promise<{ user: User }> {
    if (event !== VERIFICATION_CODE_EVENT.SIGN_UP) {
      throw new BadRequestException(errorResponse(__('Invalid event')));
    }

    if (
      !isIn(method, [
        VERIFICATION_CODE_METHOD.EMAIL,
        VERIFICATION_CODE_METHOD.SMS,
      ])
    ) {
      throw new BadRequestException(errorResponse(__('Invalid method!')));
    }

    const user = await postgres_client.user.findFirst({
      where: {
        usercode: usercode,
      },
    });
    if (!user) {
      throw new BadRequestException(errorResponse(__('Invalid user code')));
    }

    if (user.email && method != VERIFICATION_CODE_METHOD.EMAIL) {
      throw new BadRequestException(errorResponse(__('Invalid method')));
    } else if (user.phone && method != VERIFICATION_CODE_METHOD.SMS) {
      throw new BadRequestException(errorResponse(__('Invalid method')));
    }

    return {
      user,
    };
  }

  // Validate verify auth code
  async validateVerifyAuthCode(
    data: VerifyAuthCodeInput,
  ): Promise<{ user: User }> {
    const { user_code, event, method, code } = data;
    const user = await postgres_client.user.findFirst({
      where: {
        usercode: user_code,
      },
      include: {
        setting: true,
      },
    });

    if (!user) {
      throw new BadRequestException(errorResponse(__('Invalid user code')));
    }

    await this.verifyCode(user, { method, event, code });

    if (event === VERIFICATION_CODE_EVENT.SIGN_UP) {
      if (
        method == VERIFICATION_CODE_METHOD.EMAIL &&
        user.setting.email_verified === COMMON_STATUS.STATUS_ACTIVE
      ) {
        throw new BadRequestException(
          errorResponse(__('Email already verified.')),
        );
      } else if (
        method == VERIFICATION_CODE_METHOD.SMS &&
        user.setting.phone_verified === COMMON_STATUS.STATUS_ACTIVE
      ) {
        throw new BadRequestException(
          errorResponse(__('Phone already verified.')),
        );
      }
    }

    return {
      user,
    };
  }

  // send forgot password email
  async validateSendForgetPasswordNotification(
    payload: SendForgotPasswordOtpInput,
  ): Promise<{
    method_type: VERIFICATION_CODE_METHOD;
    user: User;
  }> {
    try {
      const email = payload.email || undefined;
      const phone = payload.phone || undefined;

      this.validateEmailOrPhone(email, phone);

      let user: User;
      let method_type: VERIFICATION_CODE_METHOD;

      if (email) {
        user = await postgres_client.user.findUnique({
          where: {
            email: email,
          },
        });
        method_type = VERIFICATION_CODE_METHOD.EMAIL;
      } else if (phone) {
        user = await postgres_client.user.findUnique({
          where: {
            phone: phone,
          },
        });
        method_type = VERIFICATION_CODE_METHOD.SMS;
      } else {
        throw new BadRequestException(
          errorResponse(__('Email or Phone is required')),
        );
      }

      if (!user) {
        throw new NotFoundException(errorResponse(__(`No user found`)));
      }
      if (user.status !== USER_STATUS.ACTIVE) {
        throw new BadRequestException(
          errorResponse(__(`Account is not activated yet`)),
        );
      }

      return {
        method_type,
        user,
      };
    } catch (e) {
      processException(e);
    }
  }

  // password reset process
  async validateResetPassword(
    payload: PasswordResetInput,
    req: Request,
  ): Promise<{ user: User }> {
    try {
      const email = payload.email || undefined;
      const phone = payload.phone || undefined;
      this.validateEmailOrPhone(email, phone);
      const user = await postgres_client.user.findFirst({
        where: {
          OR: [{ email: email }, { phone: phone }],
        },
      });
      if (!user) {
        throw new NotFoundException(errorResponse(__(`No user found`)));
      }
      if (user.status !== USER_STATUS.ACTIVE) {
        throw new BadRequestException(
          errorResponse(__(`Account is not activated yet`)),
        );
      }
      let checkCode = undefined;
      if (email) {
        checkCode = await this.verifyCode(user, {
          event: VERIFICATION_CODE_EVENT.FORGET_PASSWORD,
          method: VERIFICATION_CODE_METHOD.EMAIL,
          code: payload.code,
        });
      }
      if (phone) {
        checkCode = await this.verifyCode(user, {
          event: VERIFICATION_CODE_EVENT.FORGET_PASSWORD,
          method: VERIFICATION_CODE_METHOD.SMS,
          code: payload.code,
        });
      }

      if (checkCode && checkCode.success === false) {
        this.activityService.createUserActivity(
          user.id,
          req,
          ACTIVITY_EVENT.SECURITY,
          ACTIVITY.RESET_PASSWORD,
          COMMON_STATUS.STATUS_FAILED,
        );
        throw new BadRequestException(errorResponse(checkCode.message));
      }

      return {
        user,
      };
    } catch (e) {
      processException(e);
    }
  }

  // check verification code and update
  async verifyCode(user: User, code_verify_input: CodeVerifyInputs) {
    //TODO: validate otp
    // if (code_verify_input.method === VERIFICATION_CODE_METHOD.GAUTH) {
    //   this.userService.verifyG2fa(user, code_verify_input.code);
    // } else {
    //   const res = await sendHttpPostRequest(
    //     SERIVCE_URL.NOTIFICATION_SERVICE,
    //     'otp/verify',
    //     {
    //       user_type: USER_TYPE.USER,
    //       ...code_verify_input,
    //     },
    //     user.id,
    //   );
    //   if (!res.success) {
    //     throw new BadRequestException(
    //       errorResponse(__('Verification failed!')),
    //     );
    //   }
    // }
  }

  // get referral user by referral code
  private async getReferralId(referral_code?: string) {
    let referrerId = null;
    if (referral_code) {
      const referralUser = await postgres_client.user.findFirst({
        where: {
          usercode: referral_code,
        },
      });

      if (!referralUser) {
        throw new BadRequestException(
          errorResponse(__('Invalid referral code!')),
        );
      } else {
        referrerId = referralUser.id;
      }
    }
    return referrerId;
  }

  // check password validity
  private async checkPasswordValidity(payload, user) {
    const passwordValid = await this.passwordService.validatePassword(
      payload.password,
      user.password,
    );
    if (!passwordValid) {
      throw new BadRequestException(errorResponse(__('Invalid password')));
    }
  }

  // validate user email or phone
  private validateEmailOrPhone(email?: string, phone?: string) {
    if (!email && !phone) {
      throw new NotFoundException(
        errorResponse(__('Email or phone is required!')),
      );
    }
    if (email && phone) {
      throw new NotFoundException(
        errorResponse(__('Provide either email or phone!')),
      );
    }
  }

  // get user by usercode
  async getUserByCode(usercode: string): Promise<User> {
    try {
      const user = await postgres_client.user.findFirst({
        where: {
          usercode: usercode,
        },
        include: {
          setting: true,
        },
      });
      if (!user) {
        throw new NotFoundException(errorResponse(__('No user not found!')));
      }
      return user;
    } catch (error) {
      processException(error);
    }
  }
}
