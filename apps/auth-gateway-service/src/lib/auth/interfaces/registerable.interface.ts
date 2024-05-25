import { Request } from 'express';
import { GeeCaptchaInput } from '../../../app/models/custom/common.input.model';
import { ResponseModel } from '../../../app/models/custom/common.response.model';
import { LoginResponse } from '../models/login_response.model';
import { SignupInput } from '../../../app/modules/auth/user/dto/input.dto';

export interface RegisterableAuthServiceInterface {
  signup(
    payload: SignupInput,
    captcha_data?: GeeCaptchaInput,
    req?: Request,
  ): Promise<LoginResponse | ResponseModel>;
}
