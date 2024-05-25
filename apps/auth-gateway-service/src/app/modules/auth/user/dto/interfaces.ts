import { Request } from 'express';
import { VERIFICATION_CODE_METHOD } from '../../../../helpers/core_constants';
import { User } from '../../../../models/db/user.model';
import {
  PasswordResetInput,
  SendForgotPasswordOtpInput,
  SignupInput,
  UserLoginInput,
  UserSocialLoginInput,
} from './input.dto';
import { UserSocialAuthRes } from './response.dto';

export interface F_AuthValidationInterface {
  validateSignup: (payload: SignupInput) => Promise<SignupInput>;

  validateLogin: (
    payload: UserLoginInput,
    req: Request,
  ) => Promise<{
    user: User;
    deviceToken: string;
  }>;

  validateSendForgetPasswordNotification: (
    payload: SendForgotPasswordOtpInput,
  ) => Promise<{
    method_type: VERIFICATION_CODE_METHOD;
    user: User;
  }>;

  validateResetPassword: (
    payload: PasswordResetInput,
    req: Request,
  ) => Promise<{ user: User }>;
}

export interface SocialAuthInterface {
  init: (data: UserSocialLoginInput, req: Request) => void;
  authenticate: (
    data: UserSocialLoginInput,
    req: Request,
  ) => Promise<UserSocialAuthRes>;
}
