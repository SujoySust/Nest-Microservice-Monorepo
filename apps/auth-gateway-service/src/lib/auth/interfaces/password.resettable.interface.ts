import { Request } from 'express';
import { GeeCaptchaInput } from '../../../app/models/custom/common.input.model';
import { ResponseModel } from '../../../app/models/custom/common.response.model';
import {
  PasswordResetInput,
  SendForgotPasswordOtpInput,
} from '../../../app/modules/auth/user/dto/input.dto';

export interface PasswordResettableAuthServiceInterface {
  sendForgetPasswordOtp(
    payload: SendForgotPasswordOtpInput,
    captcha_data: GeeCaptchaInput,
  ): Promise<ResponseModel>;

  resetPassword(
    payload: PasswordResetInput,
    req: Request,
  ): Promise<ResponseModel>;
}
