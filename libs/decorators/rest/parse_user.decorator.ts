import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { UserModel } from '../../helpers/rest/rest.types';

import {
  sendBadRequestException,
  sendNotFoundException,
} from '../../helpers/rest/rest.functions';

import { __, postgres_client } from '../../helpers/common/common.functions';
import { USER_TYPE } from '../../helpers/common/common.constant';

export const UserEntity = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext): Promise<UserModel> => {
    const req = <Request>ctx.switchToHttp().getRequest();

    const user_id = req.header('X-User-ID');

    const user_type = req?.body?.user_type;

    if (!user_type) {
      sendBadRequestException(__('No X-User-Type sent in request body!!'));
    }

    if (!user_id) {
      sendBadRequestException(__('No X-User-ID sent in request header!!'));
    }
    if (isNaN(Number(user_id))) {
      sendBadRequestException(__('Invalid X-User-ID sent in request header!!'));
    }

    let user: UserModel;

    if (user_type == USER_TYPE.USER) {
      user = await postgres_client.user.findFirst({
        where: {
          id: BigInt(user_id),
        },
        select: {
          id: true,
          email: true,
          phone: true,
        },
      });
    } else if (user_type == USER_TYPE.STAFF) {
      user = await postgres_client.staff.findFirst({
        where: {
          id: Number(user_id),
        },
        select: {
          id: true,
          email: true,
          phone: true,
        },
      });
    } else {
      sendBadRequestException(
        __('Invalid X-User-Type sent in request header!'),
      );
    }

    if (!user) {
      sendNotFoundException(
        __('User data not found by X-User-ID sent in request header!!'),
      );
    }
    return user;
  },
);
