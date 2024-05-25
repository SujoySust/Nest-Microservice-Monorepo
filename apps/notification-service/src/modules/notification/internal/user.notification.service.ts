import { BadRequestException, Injectable } from '@nestjs/common';

import { InternalNotificationFilter } from './dto/filter.dto';
import {
  UserInternalNotifyFindManyArgs,
  UserNotificationInput,
} from './dto/input.dto';

import { UserNotificationListRes } from './dto/response.dto';

import { __ } from '@squareboat/nestjs-localization';
import {
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
} from '../../../helpers/notification.constants';

import { InternalNotificationPayload } from '../dto/input.dto';
import { NotificationData } from '../dto/response.dto';
import { NotificationInterface } from '../notification.interface';
import {
  successResponse,
  processException,
  errorResponse,
} from '../../../../../../libs/helpers/rest/rest.functions';
import {
  ResponseModel,
  UserModel,
} from '../../../../../../libs/helpers/rest/rest.types';
import {
  Prisma,
  UserNotification,
} from '../../../../../../libs/prisma/postgres/clients';
import { postgres_client } from '../../../../../../libs/helpers/common/common.functions';

@Injectable()
export class UserNotificationService
  implements NotificationInterface<InternalNotificationPayload>
{
  async send(
    user: UserModel,
    data: InternalNotificationPayload,
  ): Promise<ResponseModel> {
    try {
      const { notify_data } = data;
      const _internal_data: NotificationData =
        notify_data[NOTIFICATION_TYPE.INTERNAL];

      await this.create({
        user: user,
        title: _internal_data.title,
        description: _internal_data.description,
      });
      return successResponse(__('Notification sent successfully.'));
    } catch (error) {
      console.error(error);
    }
  }

  private async create(
    payload: UserNotificationInput,
  ): Promise<UserNotification> {
    return await postgres_client.userNotification.create({
      data: {
        user_id: BigInt(payload.user.id),
        title: payload.title,
        description: payload.description,
        status: NOTIFICATION_STATUS.UNREAD,
      },
    });
  }

  async findAll(
    data: UserInternalNotifyFindManyArgs,
  ): Promise<UserNotificationListRes> {
    try {
      const { user, limit } = data;
      const notifications: UserNotification[] =
        await postgres_client.userNotification.findMany({
          where: {
            OR: this.prepareUserCondition(BigInt(user.id), {
              not: NOTIFICATION_STATUS.CLEANED,
            }),
          },
          orderBy: [{ created_at: 'desc' }],
          take: limit || 10,
        });

      const countUnread = await postgres_client.userNotification.count({
        where: {
          OR: this.prepareUserCondition(
            BigInt(user.id),
            NOTIFICATION_STATUS.UNREAD,
          ),
          status: NOTIFICATION_STATUS.UNREAD,
        },
      });

      // const user_notif_settings =
      //   await postgres_client.userNotificationSetting.findFirst({
      //     where: { user_id: user.id },
      //   });

      // if (
      //   !user_notif_settings ||
      //   user_notif_settings.events.includes(
      //     USER_NOTIFICATION_EVENT_GROUP.SYSTEM_MESSAGE,
      //   )
      // ) {
      //   const countUnreadSystemMsg = await postgres_client.notice.count({
      //     where: {
      //       status: COMMON_STATUS.STATUS_ACTIVE,
      //       type: NOTICE_TYPE.SYSTEM_MESSAGE,
      //       users_status: {
      //         none: {
      //           user_id: user.id,
      //         },
      //       },
      //     },
      //   });

      //   countUnread += countUnreadSystemMsg;
      // }

      // notifications = await this.filterSystemMessagesWithUserNotifSetting(
      //   user_notif_settings,
      //   notifications,
      // );

      return {
        unread_count: countUnread,
        notifications: notifications,
      };
    } catch (error) {
      processException(error);
    }
  }

  private filterUserNotification(
    user_id: bigint,
    filter?: InternalNotificationFilter,
  ): Prisma.UserNotificationWhereInput {
    const where: Prisma.UserNotificationWhereInput = {
      OR: this.prepareUserCondition(user_id, {
        not: NOTIFICATION_STATUS.CLEANED,
      }),
      status: filter?.status != null ? filter.status : undefined,
    };
    return where;
  }

  private prepareUserCondition(
    user_id: bigint,
    user_notice_status_cond: Prisma.IntFilter | number,
  ): Prisma.UserNotificationWhereInput[] {
    const userCondition: Prisma.Enumerable<Prisma.UserNotificationWhereInput> =
      [
        {
          user_id: user_id,
        },
        {
          user_id: null,
          // user: {
          //   user_notification_settings: {
          //     events: { contains: USER_NOTIFICATION_EVENT_GROUP.SYSTEM_MESSAGE },
          //   },
          // },
          // notice: {
          //   OR: [
          //     {
          //       users_status: {
          //         none: {
          //           user_id: user_id,
          //         },
          //       },
          //     },
          //     {
          //       users_status: {
          //         some: {
          //           user_id: user_id,
          //           status: user_notice_status_cond,
          //         },
          //       },
          //     },
          //   ],
          // },
        },
      ];

    return userCondition;
  }

  async markAsRead(
    user: UserModel,
    uid?: string,
    event?: string,
  ): Promise<ResponseModel> {
    try {
      let notification: UserNotification = null;
      if (uid) {
        notification = await postgres_client.userNotification.findFirst({
          where: {
            uid: uid,
            OR: [{ user_id: BigInt(user.id) }, { user_id: null }],
          },
        });

        if (!notification) {
          throw new BadRequestException(
            errorResponse(__('Invalid notification!')),
          );
        }

        await postgres_client.userNotification.update({
          where: {
            uid: uid,
          },
          data: {
            status: NOTIFICATION_STATUS.READ,
          },
        });
        //
      } else {
        // mark all as read
        await postgres_client.userNotification.updateMany({
          where: {
            user_id: BigInt(user.id),
          },
          data: {
            status: NOTIFICATION_STATUS.READ,
          },
        });
      }
      return successResponse(__('Notification marked as read!'));
    } catch (error) {
      processException(error);
    }
  }

  async clearAll(user: UserModel, event?: string): Promise<ResponseModel> {
    try {
      await postgres_client.userNotification.deleteMany({
        where: {
          user_id: BigInt(user.id),
        },
      });
      return successResponse(__('Cleared all notificaitons successfully!'));
    } catch (error) {
      processException(error);
    }
  }
}
