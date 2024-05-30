import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { __ } from '../../../../../libs/helpers/common/common.functions';

export const TranslationMW: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  const result = value ? __(value) : value;
  return result;
};
