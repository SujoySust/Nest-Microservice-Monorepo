import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

import { User } from '../models/db/user.model';
import { getProtectedEmail, getProtectedPhone } from '../helpers/core_function';

export const secureUserResponseMW: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const source = ctx.source;
  const user: User = await next();
  if (!user) return user;
  if (
    (Object.prototype.hasOwnProperty.call(source, 'accessToken') ||
      Object.prototype.hasOwnProperty.call(source, 'access_token')) &&
    (source.accessToken || source.access_token)
  ) {
    return user;
  } else {
    // return app.get(F_AuthService).secureUserResponse(user);
  }
};

export const secureEmailMW: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  return getProtectedEmail(value);
};

export const securePhoneMW: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  return getProtectedPhone(value);
};

export const secureAntiPhisingMW: FieldMiddleware = async () => {
  return null;
};
