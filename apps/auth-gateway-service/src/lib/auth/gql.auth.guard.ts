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
import { checkStatusAndGetUser } from '../../app/helpers/core_function';

export function GqlAuthGuard(authProvider?: string): Type<CanActivate> {
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
  }

  return mixin(MixinGqlAuthGuard);
}
