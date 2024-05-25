import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserSocialLoginInput } from '../dto/input.dto';
import { SocialAuthInterface } from '../dto/interfaces';
import { UserSocialAuthRes } from '../dto/response.dto';
import { GoogleAuthService } from './google_auth.service';
import { REG_TYPE } from '../../../../helpers/core_constant';
import { processException } from '../../../../helpers/core_function';

@Injectable()
export class SocialAuthService implements SocialAuthInterface {
  private service: SocialAuthInterface;

  async init(data: UserSocialLoginInput, req: Request) {
    if (data.reg_type == REG_TYPE.GOOGLE) {
      this.service = new GoogleAuthService();
    }
    this.service.init(data, req);
  }

  async authenticate(
    data: UserSocialLoginInput,
    req: Request,
  ): Promise<UserSocialAuthRes> {
    try {
      return this.service.authenticate(data, req);
    } catch (error) {
      processException(error);
    }
  }
}
