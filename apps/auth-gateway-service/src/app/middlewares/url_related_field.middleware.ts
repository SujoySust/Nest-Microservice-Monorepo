import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

export const FileUrlMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  return value;
  // const fileService = app.get(FilesystemService);
  // return value ? fileService.url(value) : null;
};
