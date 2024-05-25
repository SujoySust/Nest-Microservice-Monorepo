import { BadRequestException, Injectable } from '@nestjs/common';

import { __ } from '@squareboat/nestjs-localization';
import { SendNotificationDto } from './dto/input.dto';
import { NotificationEventData } from './dto/response.dto';
import { ExternalNotificationService } from './external/external.notification.service';
import { InternalNotificationService } from './internal/internal.notification.service';
import { NotificationDataService } from './notification.data.service';
import { NotificationInterface } from './notification.interface';

import { NOTIFICATION_TYPE } from '../../helpers/notification.constants';
import {
  ResponseModel,
  UserModel,
} from '../../../../../libs/helpers/rest/rest.types';
import {
  errorResponse,
  processException,
  successResponse,
} from '../../../../../libs/helpers/rest/rest.functions';

@Injectable()
export class NotificationService
  implements NotificationInterface<SendNotificationDto>
{
  private internal_service: InternalNotificationService;
  private external_service: ExternalNotificationService;

  constructor() {
    this.internal_service = new InternalNotificationService();
    this.external_service = new ExternalNotificationService();
  }

  async send(
    user: UserModel,
    data: SendNotificationDto,
  ): Promise<ResponseModel> {
    try {
      const { event, notification_type } = data;

      const notification_data_service = new NotificationDataService();
      const notify_data = notification_data_service.userNotificationData(event);

      let res: ResponseModel;

      if (notification_type == NOTIFICATION_TYPE.INTERNAL) {
        res = await this.sendInternalNotification(user, data, notify_data);
      } else if (notification_type == NOTIFICATION_TYPE.EXTERNAL) {
        res = await this.sendExternalNotification(user, data, notify_data);
      } else if (notification_type == NOTIFICATION_TYPE.BOTH) {
        await this.sendInternalNotification(user, data, notify_data);
        await this.sendExternalNotification(user, data, notify_data);
        res = successResponse(__('Notification sent successfully'));
      } else {
        throw new BadRequestException(
          errorResponse(__('Invalid notification type!')),
        );
      }

      return res;
    } catch (error) {
      processException(error);
    }
  }

  private async sendInternalNotification(
    user: UserModel,
    input_data: SendNotificationDto,
    notify_data: NotificationEventData,
  ) {
    const { user_type } = input_data;

    return await this.internal_service.send(user, {
      user_type,
      notify_data,
    });
  }

  private async sendExternalNotification(
    user: UserModel,
    input_data: SendNotificationDto,
    notify_data: NotificationEventData,
  ) {
    const { user_type, method, event } = input_data;
    return await this.external_service.send(user, {
      method,
      user_type,
      event,
      notify_data,
    });
  }
}
