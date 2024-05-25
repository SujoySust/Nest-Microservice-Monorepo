import {
  CanActivate,
  ExecutionContext,
  Inject,
  mixin,
  Type,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthConfig } from '../../configs/config.interface';
import { checkStatusAndGetUser } from '../../app/helpers/core_function';

export function GqlGetUserGuard(authProvider?: string): Type<CanActivate> {
  class MixinGqlAuthGuard extends AuthGuard('jwt') {
    @Inject(ConfigService) private readonly configService: ConfigService;
    getRequest(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      const req = <Request>ctx.getContext().req;
      return req;
    }
    handleRequest(err, userInfo, info) {
      // You can throw an exception based on either "info" or "err" arguments
      if (err || !userInfo) {
        return null;
      } else {
        const { user, provider } = userInfo;
        if (!user) return null;
        const exactAuthProvider =
          authProvider || this.configService.get<AuthConfig>('auth').default;
        if (provider === exactAuthProvider) {
          return checkStatusAndGetUser(user);
        } else {
          return null;
        }
      }
    }
  }

  return mixin(MixinGqlAuthGuard);
}
