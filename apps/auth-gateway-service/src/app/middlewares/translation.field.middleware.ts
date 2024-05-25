import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { __ } from '../helpers/core_function';

export const TranslationMW: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  const result = value ? __(value) : value;
  return result;
};
