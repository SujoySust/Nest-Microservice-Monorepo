import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthConfig } from '../../configs/config.interface';
import { JwtHelper } from './jwt.helper';
import { app, checkStatusAndGetUser } from '../../app/helpers/core_function';
import { F_DeviceVerificationService } from '../../app/modules/auth/user/user.device.verification.service';

export function GqlAuthAndDeviceGuard(
  authProvider?: string,
): Type<CanActivate> {
  class MixinGqlAuthAndDeviceGuard
    extends AuthGuard('jwt')
    implements CanActivate
  {
    @Inject(ConfigService) private readonly configService: ConfigService;
    getRequest(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      const req = <Request>ctx.getContext().req;
      return req;
    }
    handleRequest(err, userInfo, info) {
      // You can throw an exception based on either "info" or "err" arguments
      if (err || !userInfo) {
        throw err || new UnauthorizedException();
      } else {
        const { user, provider } = userInfo;
        if (!user) throw new UnauthorizedException();
        const exactAuthProvider =
          authProvider || this.configService.get<AuthConfig>('auth').default;
        if (provider === exactAuthProvider) {
          return checkStatusAndGetUser(user);
        } else {
          throw new UnauthorizedException();
        }
      }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const parentCanActivate = (await super.canActivate(context)) as boolean;
      const req = GqlExecutionContext.create(context).getContext().req;
      const user = req.user;
      const deviceToken = req.header('dvctk');
      const deviceService = app.get(F_DeviceVerificationService);
      let bearerToken = req.header('authorization');
      bearerToken = bearerToken.replace('Bearer ', '');
      const loginSecret =
        app.get(JwtHelper).decodeToken(bearerToken)['login_secret'] ?? '';
      return (
        parentCanActivate &&
        (await deviceService.checkUserDevice(user, deviceToken, loginSecret))
      );
    }
  }

  return mixin(MixinGqlAuthAndDeviceGuard);
}
