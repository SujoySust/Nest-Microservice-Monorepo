import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Auth, google } from 'googleapis';

import { SettingService } from '../../../setting/setting.service';
import { UserSocialLoginInput } from '../dto/input.dto';
import { SocialAuthInterface } from '../dto/interfaces';
import { UserSocialAuthRes } from '../dto/response.dto';
import { app, processException } from '../../../../helpers/core_function';
import { SETTINGS_GROUP, SETTINGS_SLUG } from '../../../../helpers/slug_constants';

@Injectable()
export class GoogleAuthService implements SocialAuthInterface {
  private client_id: string;
  private client_secret: string;

  async init(data: UserSocialLoginInput, req: Request) {
    const settings = await app
      .get(SettingService)
      .getSettingsObjectData([SETTINGS_GROUP.API]);

    this.client_id = settings[SETTINGS_SLUG.GOOGLE_AUTH_CLIENT_ID];
    this.client_secret = settings[SETTINGS_SLUG.GOOGLE_AUTH_CLIENT_SECRET];
  }

  async authenticate(
    data: UserSocialLoginInput,
    req: Request,
  ): Promise<UserSocialAuthRes> {
    try {
      const { token } = data;

      const oauthClient: Auth.OAuth2Client = new google.auth.OAuth2(
        this.client_id,
        this.client_secret,
      );
      const userInfoClient = google.oauth2('v2').userinfo;

      oauthClient.setCredentials({
        access_token: token,
      });

      const userInfoResponse = await userInfoClient.get({
        auth: oauthClient,
      });

      const email = userInfoResponse.data.email;
      const googleId = userInfoResponse.data.id;

      return {
        id: googleId,
        email: email,
      };
    } catch (error) {
      processException(error);
    }
  }
}
