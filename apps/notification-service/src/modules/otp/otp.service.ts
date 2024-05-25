import { Injectable } from '@nestjs/common';
import { OtpLibService } from '../../../libs/otp/otp.lib.service';
import { ResponseModel, UserModel } from '../../helpers/core_types';
import { OTP_CODE_METHOD } from '../../helpers/notification.constants';
import {
  processException,
  successResponse,
} from '../../helpers/notification.functions';
import { SendOtpDto, VerifyOtpDto } from './dto/input.dto';
import { OtpInterface } from './otp.interface';

@Injectable()
export class OtpService implements OtpInterface {
  constructor(private readonly otp_lib_service: OtpLibService) {}

  async send(user: UserModel, data: SendOtpDto): Promise<ResponseModel> {
    try {
      const { method, event } = data;
      return await this.otp_lib_service.send(method, user, event);
    } catch (error) {
      processException(error);
    }
  }

  async verify(user: UserModel, data: VerifyOtpDto): Promise<ResponseModel> {
    try {
      const { code, method, event } = data;

      if (method === OTP_CODE_METHOD.GAUTH) {
        return this.otp_lib_service.verifyG2fa(user, code);
      } else {
        return await this.otp_lib_service.verifyCode(
          BigInt(user.id),
          method,
          event,
          code,
        );
      }
    } catch (error) {
      processException(error);
    }
  }

  async validatePhone(phone: string): Promise<ResponseModel> {
    try {
      const updated_phone = await this.otp_lib_service.validatePhone(phone);
      return successResponse('', {
        phone: updated_phone,
      });
    } catch (error) {
      processException(error);
    }
  }
}
