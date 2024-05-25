import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const UserEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let req: any = <Request>GqlExecutionContext.create(ctx).getContext().req;
    if (req) return req.user;
    req = <Request>ctx.switchToHttp().getRequest();
    return req.user;
  },
);
