import { FieldMiddleware, MiddlewareContext } from '@nestjs/graphql';

export const g2faEnableCheckMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
) => {
  const source = ctx.source;
  return source.google2fa_secret ? true : false;
};
