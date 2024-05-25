import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as fs from 'fs';
import * as qs from 'qs';
import { lastValueFrom } from 'rxjs';

import { UserSocialLoginInput } from '../dto/input.dto';
import { UserSocialAuthRes } from '../dto/response.dto';
import { __, app, detectMobileApp, errorResponse, parseDeviceInfo, processException } from '../../../../helpers/core_function';
import { SettingService } from '../../../setting/setting.service';
import { SETTINGS_GROUP, SETTINGS_SLUG } from '../../../../helpers/slug_constants';

@Injectable()
export class AppleAuthService {
  private client_id: string;
  private client_secret: string;
  private redirect_url: string;

  async init(data: UserSocialLoginInput, req: Request) {
    const settings = await app
      .get(SettingService)
      .getSettingsObjectData([SETTINGS_GROUP.API]);

    const auth_key = settings[SETTINGS_SLUG.APPLE_AUTH_KEY_ID] || '';
    const team_id = settings[SETTINGS_SLUG.APPLE_AUTH_TEAM_ID] || '';

    this.redirect_url = settings[SETTINGS_SLUG.APPLE_AUTH_REDIRECT_URL] || '';

    const service_id = settings[SETTINGS_SLUG.APPLE_AUTH_SERVICE_ID] || '';
    const bundle_id = settings[SETTINGS_SLUG.APPLE_AUTH_BUNDLE_ID] || '';

    const device = parseDeviceInfo(req.header('User-Agent'));
    const reqFromMobileApp = detectMobileApp({ device: device });

    const client_id =
      reqFromMobileApp && device.os.name.toLowerCase() == 'ios'
        ? bundle_id
        : service_id;

    this.client_id = client_id;
    this.client_secret = await this.generateClientSecretToken(
      auth_key,
      team_id,
      client_id,
    );
  }

  async authenticate(
    data: UserSocialLoginInput,
    req: Request,
  ): Promise<UserSocialAuthRes> {
    try {
      const { token } = data;
      await this.validateAppleToken(token);
      const userData = await this.getUserDataByToken(token);
      if (!userData.email) {
        throw new BadRequestException(
          errorResponse(__('Login with apple failed.')),
        );
      }
      const email = userData.email;
      const appleId = userData.sub;
      return {
        id: appleId,
        email,
      };
    } catch (error) {
      processException(error);
    }
  }

  async validateAppleToken(token: string) {
    let responseData: any;
    try {
      const httpService = app.get(HttpService);
      responseData = await lastValueFrom(
        httpService.post(
          'https://appleid.apple.com/auth/token',
          qs.stringify({
            client_id: this.client_id ?? '',
            client_secret: this.client_secret ?? '',
            code: token,
            grant_type: 'authorization_code',
            redirect_uri: this.redirect_url ?? '',
          }),
          {
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );
    } catch (e) {
      if (e?.response?.data?.error) {
        throw new Error(
          `${e.toString()}. ${JSON.stringify(e?.response?.data)}`,
        );
      } else {
        throw new Error(
          'Apple login failed due to might be credentials mismatch.',
        );
      }
    }

    if (responseData?.status !== 200) {
      throw new BadRequestException(
        errorResponse(__('Login with apple failed.')),
      );
    }
    if (!responseData?.data.id_token) {
      throw new BadRequestException(
        errorResponse(__('Token validate failed.')),
      );
    }
    return responseData?.data?.id_token;
  }

  private async generateClientSecretToken(
    auth_key: string,
    team_id: string,
    client_id: string,
  ) {
    const pvKey = fs
      .readFileSync(process.env.APPLE_PRIVATE_KEY_FILE_PATH ?? '')
      .toString();

    if (!pvKey) {
      throw new BadRequestException(errorResponse(__('Invalid private key')));
    }

    const now = Math.floor(new Date().getTime() / 1000);

    const token = new JwtService({
      signOptions: {
        header: {
          alg: 'ES256',
          kid: auth_key,
        },
      },
      // publicKey: pbKey,
      privateKey: pvKey,
    }).sign({
      iss: team_id,
      iat: now,
      exp: now + 30,
      aud: 'https://appleid.apple.com',
      sub: client_id,
    });
    return token;
  }

  private async getUserDataByToken(token: string) {
    const jwt_service = new JwtService();
    return jwt_service.decode(token);
  }
}
