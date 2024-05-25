import {Injectable, NotFoundException} from '@nestjs/common';

import { Request } from 'express';

import {
  PasswordResetInput,
  SendAuthVerifyCodeInput,
  SendForgotPasswordOtpInput,
  SignupInput,
  UserLoginInput,
  UserSocialLoginInput,
  VerifyAuthCodeInput,
} from './dto/input.dto';

import { __ } from '@squareboat/nestjs-localization';
import { AuthServiceInterface } from '../../../../lib/auth/interfaces/auth.service.interface';
import { PasswordResettableAuthServiceInterface } from '../../../../lib/auth/interfaces/password.resettable.interface';
import { RegisterableAuthServiceInterface } from '../../../../lib/auth/interfaces/registerable.interface';
import { JwtHelper } from '../../../../lib/auth/jwt.helper';
import { LoginResponse } from '../../../../lib/auth/models/login_response.model';
import { PasswordService } from '../../../../lib/auth/password.service';
import { SocialAuthService } from './social/social_auth.service';
import { F_AuthValidationService } from './user.auth.validation.service';
import { F_DeviceVerificationService } from './user.device.verification.service';

import {
  ACTIVITY,
  ACTIVITY_EVENT,
  CODE,
  COMMON_STATUS,
  REG_TYPE,
  USER_STATUS,
  VERIFICATION_CODE_EVENT,
  VERIFICATION_CODE_METHOD,
} from '../../../helpers/core_constant';

import {
  createUserCode,
  errorResponse,
  getProtectedEmail,
  getProtectedPhone,
  getUUID,
  postgres_client,
  processException,
  successResponse,
  validateUserAccountAndThrowErr,
} from '../../../helpers/core_function';

import { ResponseModel } from '../../../models/custom/common.response.model';
import { User } from '../../../models/db/user.model';
import { UserActivityService } from '../../activity/user_activity.service';
import { Prisma } from '../../../../../../../libs/prisma/postgres/clients';

@Injectable()
export class F_AuthService
  implements
    AuthServiceInterface,
    RegisterableAuthServiceInterface,
    PasswordResettableAuthServiceInterface
{
  constructor(
    private readonly jwtHelper: JwtHelper,
    private readonly passwordService: PasswordService,
    private readonly deviceVerificationService: F_DeviceVerificationService,
    private readonly activityService: UserActivityService,
    private readonly validationService: F_AuthValidationService,
  ) {}

  // user sign up service
  async signup(payload: SignupInput): Promise<LoginResponse> {
    try {
      payload = await this.validationService.validateSignup(payload);

      const hashed_password = await this.passwordService.hashPassword(
        payload.password,
      );

      const usercode = createUserCode();

      const input_payload: Prisma.UserUncheckedCreateInput = {
        usercode: usercode,
        email: payload.email ?? undefined,
        phone: payload.phone ?? undefined,
        password: hashed_password,
        reg_type: REG_TYPE.REGULAR,
        status: USER_STATUS.INACTIVE,
      };

      const user = await this.processSignUp(input_payload);
      return {
        ...successResponse(''),
        user: user,
      };
    } catch (e) {
      processException(e);
    }
  }

  // user login service
  async login(payload: UserLoginInput, req: Request): Promise<LoginResponse> {
    try {
      const { user, deviceToken } = await this.validationService.validateLogin(
        payload,
        req,
      );
      return await this.processLogin(user, deviceToken, req, payload);
    } catch (e) {
      processException(e);
    }
  }

  // user social login
  async socialLogin(
    data: UserSocialLoginInput,
    req: Request,
  ): Promise<LoginResponse> {
    try {
      const { reg_type } = data;
      const deviceToken = req.header('dvctk');

      const social_auth_service = new SocialAuthService();
      await social_auth_service.init(data, req);
      const { id: social_id, email } = await social_auth_service.authenticate(
        data,
        req,
      );

      const user = await postgres_client.user.findFirst({
        where: {
          social_id: social_id,
          reg_type: reg_type,
        },
      });

      if (user) {
        return await this.processLogin(user, deviceToken, req, {
          email: user.email,
        });
      } else {
        const payload: Prisma.UserUncheckedCreateInput = {
          usercode: createUserCode(),
          email: email,
          reg_type,
          social_id,
          status: USER_STATUS.ACTIVE,
        };
        const user = await this.processSignUp(payload);

        return await this.processLogin(user, deviceToken, req, {
          email: user.email,
        });
      }
    } catch (e) {
      processException(e);
    }
  }

  // Process user signup
  private async processSignUp(payload: Prisma.UserUncheckedCreateInput) {
    const user = await this.createUser(payload);
    // emitEvent(EVENT_NAME.SIGNUP, {
    //   user: user,
    // });
    return user;
  }

  // Process user login
  async processLogin(
    user: User,
    deviceToken: string,
    req: Request,
    payload?: UserLoginInput,
    ignoreAllCheck = false,
  ): Promise<LoginResponse> {
    if (!ignoreAllCheck && user.status === USER_STATUS.ACTIVE) {
      const device_verify_res =
        await this.deviceVerificationService.userDeviceVerificationCheck(
          user,
          deviceToken,
        );

      if (!device_verify_res.success) return device_verify_res;
      deviceToken = device_verify_res.deviceToken;
    }
    const login_res = this.processLoginResponse(
      user,
      req,
      deviceToken,
      payload,
      ignoreAllCheck,
    );
    return login_res;
  }

  // Process login response data
  private async processLoginResponse(
    user: User,
    req: Request,
    deviceToken: string,
    payload?: UserLoginInput,
    ignoreAllCheck = false,
  ): Promise<LoginResponse> {
    const res: LoginResponse = errorResponse();
    if (
      payload.email &&
      user?.setting?.email_verified !== COMMON_STATUS.STATUS_ACTIVE
    ) {
      res.code = CODE.VERIFY_EMAIL;
      res.user = user;
      res.message = __('Please verify your email to login');
    } else if (
      payload.phone &&
      user?.setting?.phone_verified !== COMMON_STATUS.STATUS_ACTIVE
    ) {
      res.code = CODE.VERIFY_PHONE;
      res.user = user;
      res.message = __('Please verify your phone to login');
    } else if (
      !ignoreAllCheck &&
      user?.setting?.login_twofa_enabled === COMMON_STATUS.STATUS_ACTIVE
    ) {
      validateUserAccountAndThrowErr(user);
      res.code = CODE.VERIFY_LOGIN_TWOFA;
      res.user = user;
      res.message = __('Please verify two factor authentication.');
    } else {
      validateUserAccountAndThrowErr(user);
      res.code = 200;
      res.message = __('Logged in successfully');
      res.success = true;
      const loginSecret = getUUID();
      const token = this.jwtHelper.generateToken({
        authIdentifier: String(user.id),
        login_secret: loginSecret,
      });
      res.user = user;
      res.accessToken = token.accessToken;
      res.refreshToken = token.refreshToken;
      res.expireAt = token.expireAt;
      const device =
        await this.deviceVerificationService.createOrUpdateUserDevice(
          user,
          req,
          loginSecret,
          token.expireAt,
          deviceToken,
        );

      res.deviceToken = device.device_token;
      res.deviceTokenExpireAt = device.device_token_expires_at;

      this.activityService.createUserActivity(
        user.id,
        req,
        ACTIVITY_EVENT.LOGIN,
        ACTIVITY.LOGIN,
        COMMON_STATUS.STATUS_ACTIVE,
      );
    }
    if (res.user?.setting) {
      res.user.setting.last_login_time = new Date();
    }
    return res;
  }

  // send user auth verification code
  async sendAuthVerificationCode(
    data: SendAuthVerifyCodeInput,
  ): Promise<ResponseModel> {
    try {
      const { user_code, method, event } = data;

      const { user } =
        await this.validationService.validateSendAuthVerificationCode(
          user_code,
          method,
          event,
        );

      // TODO: send notification
      // const res = await sendHttpPostRequest(
      //   SERIVCE_URL.NOTIFICATION_SERVICE,
      //   'otp/send',
      //   {
      //     user_type: USER_TYPE.USER,
      //     event: event,
      //     method: method,
      //   },
      //   user.id,
      // );

      // if (!res.success) {
      //   throw new BadRequestException(
      //     errorResponse(__('Verify code send failed!')),
      //   );
      // }

      return successResponse(__('Verify code sent successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  // verify user auth code
  async verifyAuthCode(
    data: VerifyAuthCodeInput,
    req: Request,
  ): Promise<LoginResponse> {
    try {
      let { user } = await this.validationService.validateVerifyAuthCode(data);

      if (data.event == VERIFICATION_CODE_EVENT.SIGN_UP) {
        user = await postgres_client.user.update({
          where: {
            id: user.id,
          },
          data: {
            status: USER_STATUS.ACTIVE,
            setting: {
              update: {
                where: {
                  user_id: user.id,
                },
                data:
                  data.method == VERIFICATION_CODE_METHOD.EMAIL
                    ? {
                        email_verified: COMMON_STATUS.STATUS_ACTIVE,
                        last_email_verified_at: new Date(),
                      }
                    : {
                        phone_verified: COMMON_STATUS.STATUS_ACTIVE,
                        last_phone_verified_at: new Date(),
                      },
              },
            },
          },
          include: {
            setting: true,
          },
        });
      }

      let deviceToken = null;
      if (user.setting.device_check_enabled) {
        deviceToken = req.header('dvctk');
      }

      return await this.processLogin(
        user,
        deviceToken,
        req,
        {
          email: user.email || undefined,
          phone: user.phone || undefined,
        },
        true,
      );
    } catch (e) {
      processException(e);
    }
  }

  async checkDeviceToken(
    userId: bigint,
    deviceToken: string,
  ): Promise<boolean> {
    const device = await this.deviceVerificationService.getDeviceByToken(
      deviceToken,
      userId,
    );
    if (device) return true;
    return false;
  }

  async getUserByIdentifier(
    authIdentifier: string | number | bigint,
    login_secret?: string,
  ): Promise<User> {
    if (!login_secret || !authIdentifier) return null;

    const userDevice = await postgres_client.userDevices.findFirst({
      where: {
        user_id: BigInt(authIdentifier),
        login_secret: login_secret ?? '',
        status: COMMON_STATUS.STATUS_ACTIVE,
      },
      include: {
        user: {
          include: {
            setting: true,
          },
        },
      },
    });

    if (
      userDevice &&
      (new Date(userDevice.login_secret_expires_at).getTime() <=
        new Date().getTime() ||
        new Date(userDevice.device_token_expires_at).getTime() <=
          new Date().getTime())
    ) {
      return null;
    }

    return userDevice?.user;
  }

  async getUserFromToken(token: string): Promise<User> {
    const { authIdentifier } = this.jwtHelper.authIdentifierFromToken(token);
    return await postgres_client.user.findUnique({
      where: { id: BigInt(authIdentifier) },
    });
  }

  refreshToken(token: string): LoginResponse {
    return <LoginResponse>this.jwtHelper.refreshToken(token);
  }

  // send forgot password email
  async sendForgetPasswordOtp(
    payload: SendForgotPasswordOtpInput,
  ): Promise<ResponseModel> {
    try {
      const { user, method_type } =
        await this.validationService.validateSendForgetPasswordNotification(
          payload,
        );

      // TODO: Send otp from here
      // const res = await sendHttpPostRequest(
      //   SERIVCE_URL.NOTIFICATION_SERVICE,
      //   'otp/send',
      //   {
      //     user_type: USER_TYPE.USER,
      //     method: method_type,
      //     event: VERIFICATION_CODE_EVENT.FORGET_PASSWORD,
      //   },
      //   user.id,
      // );

      // if (!res.success) {
      //   throw new BadRequestException(
      //     errorResponse(__('Reset password code sending failed!')),
      //   );
      // }

      return successResponse(__('Reset password code sent successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  // password reset process
  async resetPassword(
    payload: PasswordResetInput,
    req: Request,
  ): Promise<ResponseModel> {
    try {
      const { user } = await this.validationService.validateResetPassword(
        payload,
        req,
      );

      const hashedPassword = await this.passwordService.hashPassword(
        payload.password,
      );

      await postgres_client.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      this.activityService.createUserActivity(
        user.id,
        req,
        ACTIVITY_EVENT.SECURITY,
        ACTIVITY.RESET_PASSWORD,
        COMMON_STATUS.STATUS_ACTIVE,
      );

      return successResponse(__('Password reset successfully'));
    } catch (e) {
      processException(e);
    }
  }

  // user logout process
  async logout(req: Request, user: User): Promise<ResponseModel> {
    try {
      const bearerToken = req.header('authorization');
      if (bearerToken) {
        const token = bearerToken.replace('Bearer ', '');
        const tokenData = this.jwtHelper.decodeToken(token);
        if (tokenData && tokenData['login_secret']) {
          await postgres_client.userDevices.updateMany({
            where: {
              login_secret: tokenData['login_secret'],
              user_id: user.id,
            },
            data: {
              login_secret: null,
              login_secret_expires_at: null,
            },
          });
        }
      }

      this.activityService.createUserActivity(
        user.id,
        req,
        ACTIVITY_EVENT.LOGIN,
        ACTIVITY.LOGOUT,
        COMMON_STATUS.STATUS_ACTIVE,
      );

      return successResponse(__('Logout successful.'));
    } catch (error) {
      processException(error);
    }
  }

  // Create new user
  private async createUser(payload: Prisma.UserUncheckedCreateInput) {
    return await postgres_client.$transaction(async (prisma) => {
      const user: User = await prisma.user.create({
        data: {
          ...payload,
        },
      });

      await prisma.userSetting.create({
        data: {
          user_id: user.id,
        },
      });

      return user;
    });
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

  // secure user response
  secureUserResponse(user: User): User {
    user.email = getProtectedEmail(user.email);
    user.phone = getProtectedPhone(user.phone);
    if (user.setting) {
      user.setting.anti_phishing_code = null;
      user.setting.last_anti_phishing_updated_at = null;
    }
    return user;
  }
}
