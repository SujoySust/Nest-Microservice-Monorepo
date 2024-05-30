import { BadRequestException, Injectable } from '@nestjs/common';

import { authenticator } from 'otplib';

import { DefaultArgs } from '@prisma/client/runtime/library';

import { __ } from '@squareboat/nestjs-localization';
import { EmailLibService } from './email.lib.service';
import { SmsLibService } from './sms.lib.service';
import {
  USER_TYPE,
  COMMON_STATUS,
} from '../../../../../libs/helpers/common/common.constant';
import {
  fakeTrans,
  getSettingsGroup,
  getRandomInt,
  addMinutes,
  diff_seconds,
  ucfirst,
} from '../../../../../libs/helpers/common/common.functions';
import {
  SETTINGS_GROUP,
  SETTINGS_SLUG,
} from '../../../../../libs/helpers/common/common.slugs';
import {
  errorResponse,
  successResponse,
} from '../../../../../libs/helpers/rest/rest.functions';
import { ResponseModel } from '../../../../../libs/helpers/rest/rest.types';
import { UserModel } from '../../../../../libs/helpers/rest/rest.types';

import {
  Prisma,
  PrismaClient,
  UserVerifyCodes,
} from '../../../../../libs/prisma/postgres/clients';

import {
  VERIFY_CODE_EXPIRATION_TIME_IN_MIN,
  VERIFY_CODE_RESEND_TIME_IN_SEC,
  USER_CREDENTIALS,
} from '../../../../auth-gateway-service/src/app/helpers/core_constant';

import {
  OTP_CODE_METHOD,
  OTP_CODE_EVENT,
} from '../../helpers/notification.constants';

import { SendOtpDto, VerifyOtpDto } from '../../modules/otp/dto/input.dto';
import { postgres_client } from '../../helpers/notification.functions';

@Injectable()
export class OtpLibService {
  private email_service: EmailLibService;
  private sms_service: SmsLibService;

  constructor() {
    this.email_service = new EmailLibService();
    this.sms_service = new SmsLibService();
  }

  // user send otp code
  async send(user: UserModel, data: SendOtpDto): Promise<ResponseModel> {
    const { user_type, method, event } = data;

    const code_data = await this.generateCode(user.id, method, event);

    const message =
      this.OtpCodeEventMessages(code_data.code, method)[event] ??
      fakeTrans('Your verification OTP code is ') + code_data.code;

    if (user_type == USER_TYPE.USER) {
      await this.createUserOtpCode(code_data);
    } else if (user_type == USER_TYPE.STAFF) {
      await this.createStaffOtpCode(Number(user.id), code_data.code);
    }

    if (method == OTP_CODE_METHOD.EMAIL) {
      return await this.email_service.sendEmail(user, code_data.code, message);
    } else if (method == OTP_CODE_METHOD.SMS) {
      await this.sms_service.init();
      return this.sms_service.sendSms(user.phone, message);
    } else {
      throw new BadRequestException(errorResponse(__('Invalid method!')));
    }
  }

  // user verify otp code
  async verifyCode(
    user_or_staff_id: bigint | number | string,
    code_input: VerifyOtpDto,
  ) {
    const { user_type } = code_input;
    if (user_type == USER_TYPE.USER) {
      return this.verifyUserCode(BigInt(user_or_staff_id), code_input);
    } else if (user_type == USER_TYPE.STAFF) {
      return this.verifyStaffCode(Number(user_or_staff_id), code_input);
    }
  }

  async verifyUserCode(userId: bigint, code_input: VerifyOtpDto) {
    const { method, event, code } = code_input;

    if (method == OTP_CODE_METHOD.GAUTH) {
      const user_setting = await postgres_client.userSetting.findFirst({
        where: {
          user_id: userId,
        },
        select: {
          google2fa_secret: true,
        },
      });
      return await this.verifyG2fa(user_setting.google2fa_secret, code);
    } else {
      const check_code = await postgres_client.userVerifyCodes.findFirst({
        where: {
          user_id: userId,
          method: method,
          event: event,
          code: code,
          status: COMMON_STATUS.STATUS_INACTIVE,
          expires_at: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
        },
      });

      if (!check_code) {
        return errorResponse(__('Invalid code or expired'));
      }

      await postgres_client.userVerifyCodes.update({
        where: {
          id: check_code.id,
        },
        data: {
          status: COMMON_STATUS.STATUS_ACTIVE,
          code: null,
        },
      });
      return successResponse(__('Code verified successfully'));
    }
  }

  async verifyStaffCode(staff_id: number, code_input: VerifyOtpDto) {
    const { method, code } = code_input;
    if (method == OTP_CODE_METHOD.GAUTH) {
      const staff = await postgres_client.staff.findFirst({
        where: {
          id: staff_id,
        },
        select: {
          google2fa_secret: true,
        },
      });
      return await this.verifyG2fa(staff.google2fa_secret, code);
    } else {
      const check_code = await postgres_client.staff.findFirst({
        where: {
          id: staff_id,
          resetcode: code,
          last_code_sent_at: {
            gt: new Date(),
          },
        },
        select: {
          resetcode: true,
          last_code_sent_at: true,
        },
      });

      if (!check_code) {
        return errorResponse(__('Invalid code or expired'));
      }

      await postgres_client.staff.update({
        where: {
          id: staff_id,
        },
        data: {
          resetcode: null,
          last_code_sent_at: null,
        },
      });
      return successResponse(__('Code verified successfully'));
    }
  }

  // verifiy user g2fa
  async verifyG2fa(secret: string, code: string): Promise<ResponseModel> {
    if (
      !authenticator.verify({
        token: code,
        secret: secret,
      })
    )
      return errorResponse(__('Invalid OTP code'));
    return successResponse('');
  }

  // check code verify and update
  async validatePhone(phone: string): Promise<string> {
    return this.sms_service.validatePhone(phone);
  }

  // make user verify code data
  private async generateCode(
    userId: bigint | number | string,
    method: number,
    event: number,
  ) {
    const settings = getSettingsGroup(postgres_client, [
      SETTINGS_GROUP.APPLICATION,
    ]);

    const verify_code_expiration_time_in_sec =
      settings[SETTINGS_SLUG.VERIFY_CODE_EXPIRATION_TIME_IN_MIN] ??
      VERIFY_CODE_EXPIRATION_TIME_IN_MIN;

    const code = getRandomInt(6);
    const data: UserVerifyCodes = {
      id: undefined,
      code: code,
      user_id: BigInt(userId),
      method: method,
      event: event,
      status: COMMON_STATUS.STATUS_INACTIVE,
      last_sent_at: new Date(),
      expires_at: addMinutes(new Date(), verify_code_expiration_time_in_sec),
      created_at: new Date(),
      updated_at: new Date(),
    };
    return data;
  }

  // create user verify code data
  private async createUserOtpCode(
    data: UserVerifyCodes,
    prisma?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    prisma = prisma ?? postgres_client;
    const alreadyHave = await prisma.userVerifyCodes.findFirst({
      where: {
        user_id: data.user_id,
        method: data.method,
        event: data.event,
      },
    });
    let verifyCode: UserVerifyCodes;
    if (alreadyHave) {
      const secDiff = diff_seconds(new Date(), alreadyHave.last_sent_at);
      const settings = await getSettingsGroup(postgres_client, [
        SETTINGS_GROUP.APPLICATION,
      ]);

      const verify_code_resend_time_in_sec = settings[
        SETTINGS_SLUG.VERIFY_CODE_RESEND_TIME_IN_SEC
      ]
        ? parseFloat(settings[SETTINGS_SLUG.VERIFY_CODE_RESEND_TIME_IN_SEC])
        : VERIFY_CODE_RESEND_TIME_IN_SEC;

      if (secDiff < verify_code_resend_time_in_sec)
        throw new BadRequestException(
          errorResponse(
            __(
              'Please resend code after ' +
                (verify_code_resend_time_in_sec - secDiff) +
                ' secs',
            ),
          ),
        );
      verifyCode = await prisma.userVerifyCodes.update({
        where: {
          id: alreadyHave.id,
        },
        data: data,
      });
    } else {
      verifyCode = await prisma.userVerifyCodes.create({
        data: data,
      });
    }
    return verifyCode;
  }

  private async createStaffOtpCode(
    staff_id: number,
    code: string,
    prisma?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    prisma = prisma ?? postgres_client;
    const staff = await prisma.staff.findFirst({
      where: {
        id: staff_id,
      },
      select: {
        resetcode: true,
        last_code_sent_at: true,
      },
    });
    if (!staff) {
      throw new BadRequestException(errorResponse(__('Invalid request!')));
    }

    if (staff.resetcode && staff.last_code_sent_at) {
      await this.validateResendCodeTime(staff.last_code_sent_at);
    }

    await prisma.staff.update({
      where: {
        id: staff_id,
      },
      data: {
        resetcode: code,
        last_code_sent_at: new Date(),
      },
    });
  }

  private async validateResendCodeTime(last_sent_at: Date) {
    const secDiff = diff_seconds(new Date(), last_sent_at);
    const settings = await getSettingsGroup(postgres_client, [
      SETTINGS_GROUP.APPLICATION,
    ]);

    const verify_code_resend_time_in_sec = settings[
      SETTINGS_SLUG.VERIFY_CODE_RESEND_TIME_IN_SEC
    ]
      ? parseFloat(settings[SETTINGS_SLUG.VERIFY_CODE_RESEND_TIME_IN_SEC])
      : VERIFY_CODE_RESEND_TIME_IN_SEC;

    if (secDiff < verify_code_resend_time_in_sec)
      throw new BadRequestException(
        errorResponse(
          __(
            'Please resend code after ' +
              (verify_code_resend_time_in_sec - secDiff) +
              ' secs',
          ),
        ),
      );
  }

  // get otp code event message
  private OtpCodeEventMessages(code: string, method: OTP_CODE_METHOD) {
    let methodInStr: string =
      method == OTP_CODE_METHOD.EMAIL
        ? USER_CREDENTIALS.EMAIL
        : USER_CREDENTIALS.PHONE;

    methodInStr = ucfirst(methodInStr);
    const isEmail = method == OTP_CODE_METHOD.EMAIL;

    const codeMsg = isEmail
      ? `<p style="font-size:25px; margin:10px 0px;">${code}</p>`
      : `${code}. `;

    const commonMsgPrefix =
      fakeTrans('Your') + ' ' + (isEmail ? '<strong>' : '');
    const commonMsgSuffix =
      (isEmail ? '</strong>' : '') + ' ' + fakeTrans('OTP is') + ' ';

    return {
      [OTP_CODE_EVENT.SIGN_UP]:
        commonMsgPrefix +
        fakeTrans('Sign Up Verification') +
        commonMsgSuffix +
        codeMsg +
        fakeTrans('Please verify now.'),

      [OTP_CODE_EVENT.LOGIN_2FA]:
        commonMsgPrefix +
        fakeTrans('Login Two Factor') +
        commonMsgSuffix +
        codeMsg +
        fakeTrans('Please verify your login two factor using this code.'),

      [OTP_CODE_EVENT.FORGET_PASSWORD]:
        commonMsgPrefix +
        fakeTrans('Reset Password') +
        commonMsgSuffix +
        codeMsg +
        fakeTrans('Please reset your password using this code'),

      [OTP_CODE_EVENT.DEVICE_VERIFICATION]:
        commonMsgPrefix +
        fakeTrans('Device Verification') +
        commonMsgSuffix +
        codeMsg +
        fakeTrans('Please verify your device using this code.'),

      [OTP_CODE_EVENT.PASSWORD_CHANGE]:
        commonMsgPrefix +
        fakeTrans('Password Update') +
        commonMsgSuffix +
        codeMsg +
        '',

      [OTP_CODE_EVENT.DEVICE_VERIFICATION_ENABLE_DISABLE]:
        commonMsgPrefix +
        fakeTrans('Device Verification Enable/Disable') +
        commonMsgSuffix +
        codeMsg +
        fakeTrans(
          'Please change your device verification settings using this code.',
        ),

      [OTP_CODE_EVENT.LOGIN_TWOFA_ENABLE_DISABLE]:
        commonMsgPrefix +
        fakeTrans('Login Twofa Enable/Disable') +
        commonMsgSuffix +
        codeMsg +
        fakeTrans('Please change your twofa settings using this code.'),

      [OTP_CODE_EVENT.LOGOUT_FROM_OTHER_DEVICE]:
        commonMsgPrefix +
        fakeTrans('Logout From Other Device') +
        commonMsgSuffix +
        codeMsg +
        'Please logout your other devices using this code',
    };
  }
}
