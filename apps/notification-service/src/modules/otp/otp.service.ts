import { Injectable } from '@nestjs/common';
import { OTP_CODE_METHOD } from '../../helpers/notification.constants';

import { SendOtpDto, VerifyOtpDto } from './dto/input.dto';
import { OtpInterface } from './otp.interface';
import { OtpLibService } from '../../lib/otp/otp.lib.service';
import {
  ResponseModel,
  UserModel,
} from '../../../../../libs/helpers/rest/rest.types';
import {
  processException,
  successResponse,
} from '../../../../../libs/helpers/rest/rest.functions';

@Injectable()
export class OtpService implements OtpInterface {
  constructor(private readonly otp_lib_service: OtpLibService) {}

  async send(user: UserModel, data: SendOtpDto): Promise<ResponseModel> {
    try {
      return await this.otp_lib_service.send(user, data);
    } catch (error) {
      processException(error);
    }
  }

  async verify(user: UserModel, data: VerifyOtpDto): Promise<ResponseModel> {
    try {
      return await this.otp_lib_service.verifyCode(user.id, data);
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
