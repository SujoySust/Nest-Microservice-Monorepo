import { BadRequestException, Injectable } from '@nestjs/common';

import { __ } from '@squareboat/nestjs-localization';
import { InternalNotificationPayload } from '../dto/input.dto';
import { NotificationData } from '../dto/response.dto';
import { NotificationInterface } from '../notification.interface';

import {
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
} from '../../../helpers/notification.constants';
import {
  successResponse,
  errorResponse,
  processException,
} from '../../../../../../libs/helpers/rest/rest.functions';
import { ResponseModel } from '../../../../../../libs/helpers/rest/rest.types';
import { UserModel } from '../../../../../../libs/helpers/rest/rest.types';
import {
  StaffNotification,
  Staff,
  Prisma,
} from '../../../../../../libs/prisma/postgres/clients';
import { postgres_client } from '../../../../../../libs/helpers/common/common.functions';

@Injectable()
export class StaffNotificationService
  implements NotificationInterface<InternalNotificationPayload>
{
  async send(
    staff: UserModel,
    data: InternalNotificationPayload,
  ): Promise<ResponseModel> {
    try {
      const { notify_data } = data;
      const _internal_data: NotificationData =
        notify_data[NOTIFICATION_TYPE.INTERNAL];

      await this.create({
        staff_id: Number(staff.id),
        title: _internal_data.title,
        description: _internal_data.description,
      });

      return successResponse(__('Notification sent successfully.'));
    } catch (error) {
      console.error(error);
    }
  }

  async create(
    data: Prisma.StaffNotificationUncheckedCreateInput,
  ): Promise<StaffNotification> {
    return await postgres_client.staffNotification.create({
      data: data,
    });
  }

  async markAsRead(staff: Staff, uid?: string): Promise<ResponseModel> {
    try {
      let notification: StaffNotification = null;
      if (uid) {
        notification = await postgres_client.staffNotification.findFirst({
          where: {
            uid: uid,
            staff_id: staff.id,
          },
        });

        if (!notification) {
          throw new BadRequestException(
            errorResponse(__('Invalid notification!')),
          );
        }

        await postgres_client.staffNotification.update({
          where: {
            uid: uid,
          },
          data: {
            status: NOTIFICATION_STATUS.READ,
          },
        });
      } else {
        await postgres_client.staffNotification.updateMany({
          where: {
            staff_id: staff.id,
          },
          data: {
            status: NOTIFICATION_STATUS.READ,
          },
        });
      }

      return successResponse();
    } catch (error) {
      processException(error);
    }
  }

  async clearAll(staff: Staff): Promise<ResponseModel> {
    try {
      const whereOr: Prisma.Enumerable<Prisma.StaffNotificationWhereInput> = [
        {
          staff_id: staff.id,
        },
        {
          staff_id: null,
        },
      ];

      const where: Prisma.StaffNotificationWhereInput = {
        OR: whereOr,
      };

      await postgres_client.staffNotification.deleteMany({
        where: {
          ...where,
        },
      });

      return successResponse();
    } catch (error) {
      processException(error);
    }
  }
}
