import { BadRequestException, Injectable } from '@nestjs/common';

import { __ } from '@squareboat/nestjs-localization';
import { InternalNotificationPayload } from '../dto/input.dto';
import { NotificationInterface } from '../notification.interface';
import { StaffNotificationService } from './staff.notification.service';
import { UserNotificationService } from './user.notification.service';
import {
  ResponseModel,
  UserModel,
} from '../../../../../../libs/helpers/rest/rest.types';
import { USER_TYPE } from '../../../../../../libs/helpers/common/common.constant';
import { errorResponse } from '../../../../../../libs/helpers/rest/rest.functions';

@Injectable()
export class InternalNotificationService
  implements NotificationInterface<InternalNotificationPayload>
{
  private user_notification_service: UserNotificationService;
  private staff_notification_service: StaffNotificationService;

  constructor() {
    this.user_notification_service = new UserNotificationService();
    this.staff_notification_service = new StaffNotificationService();
  }

  async send(
    user: UserModel,
    data: InternalNotificationPayload,
  ): Promise<ResponseModel> {
    try {
      if (data.user_type == USER_TYPE.USER) {
        return this.user_notification_service.send(user, data);
      } else if (data.user_type == USER_TYPE.STAFF) {
        return this.staff_notification_service.send(user, data);
      } else {
        throw new BadRequestException(
          errorResponse(__('Invalid notification type!')),
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
}
