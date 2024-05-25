import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { OrderBy } from '../../models/custom/common.input.model';
import { UserActivityModel } from '../../models/db/user_activity.model';
import { Prisma } from '../../../../../../libs/prisma/postgres/clients';
import { UserActivityConnection } from '../../models/custom/pagination.connections.model';
import { IpLocationService } from '../../core.services/ip_location.service';
import { PaginationArgs } from '../../../lib/graphql/pagination/pagination.args';
import { pOptionsBigInt } from '../../../lib/graphql/pagination/number_cursor';

import { ACTIVITY_EVENT, ACTIVITY } from '../../helpers/core_constant';

import {
  app,
  detectDeviceType,
  getLocation,
  parseDeviceInfo,
  postgres_client,
} from '../../helpers/core_function';
import { DB_QUERY_DEFAULT } from '../../../../../../libs/helpers/common/common.constant';
import { processException } from '../../../../../../libs/helpers/graphql/graphql.functions';

@Injectable()
export class UserActivityService {
  async createUserActivity(
    user_id: bigint | number,
    req: Request,
    event: ACTIVITY_EVENT,
    activity: ACTIVITY,
    status: number,
    description?: string,
  ): Promise<UserActivityModel> {
    try {
      const userAgent = req.header('User-Agent');
      const device = parseDeviceInfo(userAgent);
      const device_type = detectDeviceType({ device });

      const location = getLocation(
        await app.get(IpLocationService).getOrCreateIpLocation(req.ip),
      );

      const deviceToken = req.header('dvctk') ?? '';
      const userDevice = await postgres_client.userDevices.findFirst({
        where: { device_token: deviceToken },
        select: { id: true },
      });

      const user_activity = await postgres_client.userActivities.create({
        data: {
          user_id: user_id,
          ip_address: req.ip,
          device_id: userDevice?.id,
          event: event,
          activity: activity,
          description: description,
          status: status,
          device_type: device_type,
          device_info: JSON.stringify(device),
          user_agent: userAgent,
          location: location,
        },
      });
      if (activity == ACTIVITY.LOGIN) {
        await postgres_client.userSetting.update({
          where: {
            user_id: user_id,
          },
          data: {
            last_login_time: new Date(),
          },
        });
      }

      this.sendUserActivityNotification(req, BigInt(user_id), activity);

      return user_activity;
    } catch (error) {
      console.error(error.stack);
    }
  }

  private async sendUserActivityNotification(
    req: Request,
    user_id: bigint,
    activity: ACTIVITY,
  ) {
    try {
      const user = await postgres_client.user.findUnique({
        where: {
          id: BigInt(user_id),
        },
      });

      //TODO: Send notification

      // let notification: NOTIFICATION_EVENTS;
      // if (activity == ACTIVITY.LOGIN) {
      //   const ip = req.ip;
      //   if (ip) {
      //     const check_ip = await postgres_client.userActivities.findFirst({
      //       where: {
      //         ip_address: ip,
      //       },
      //     });
      //     if (!check_ip) {
      //       notification = NOTIFICATION_EVENTS.LOGIN_FROM_NEW_IP;
      //     }
      //   }
      // } else {
      //   notification = ACTIVITY_NOTIFICATION_MAP[activity];
      // }

      // if (notification) {
      //   const res = await sendHttpPostRequest(
      //     SERIVCE_URL.NOTIFICATION_SERVICE,
      //     'notifications/send',
      //     {
      //       user_type: USER_TYPE.USER,
      //       notification_type: NOTIFICATION_TYPE.INTERNAL,
      //       event: notification,
      //     },
      //     user.id,
      //   );

      //   if (!res.success) {
      //     throw new BadRequestException(errorResponse(res.message));
      //   }
      // }
    } catch (error) {
      console.error(error);
    }
  }

  async getUserActivity(
    where?: Prisma.UserActivitiesWhereInput,
  ): Promise<UserActivityModel[]> {
    try {
      return await postgres_client.userActivities.findMany({
        where: where,
        include: {
          user: true,
        },
      });
    } catch (error) {
      console.error(error.stack);
    }
  }

  async getUserActivityPaginate(
    paginate: PaginationArgs,
    orderBy?: OrderBy,
    where?: Prisma.UserActivitiesWhereInput,
  ): Promise<UserActivityConnection> {
    try {
      return findManyCursorConnection<
        UserActivityModel,
        Pick<Prisma.UserActivitiesWhereUniqueInput, 'id'>
      >(
        (args) =>
          postgres_client.userActivities.findMany({
            where: where,
            include: {
              user: true,
            },
            orderBy: {
              [orderBy?.field ?? DB_QUERY_DEFAULT.ORDER_FIELD]:
                orderBy?.direction ?? DB_QUERY_DEFAULT.ORDER_DIRECTION,
            },
            ...args,
          }),
        () =>
          postgres_client.userActivities.count({
            where: where,
          }),
        paginate,
        pOptionsBigInt,
      );
    } catch (error) {
      processException(error);
    }
  }
}
