import { BadRequestException, Injectable } from '@nestjs/common';

import { __ } from '@squareboat/nestjs-localization';
import { EXTERNAL_NOTIFICATION_METHOD } from '../../../helpers/notification.constants';
import {
  ExternalNotificationPayload,
  InternalNotificationPayload,
} from '../dto/input.dto';
import { NotificationInterface } from '../notification.interface';
import { EmailNotificationService } from './email/email.notification.service';
import { SmsNotificationService } from './sms/sms.notification.service';
import {
  ResponseModel,
  UserModel,
} from '../../../../../../libs/helpers/rest/rest.types';
import { errorResponse } from '../../../../../../libs/helpers/rest/rest.functions';

@Injectable()
export class ExternalNotificationService
  implements NotificationInterface<InternalNotificationPayload>
{
  private email_notify_service: EmailNotificationService;
  private sms_notify_service: SmsNotificationService;

  constructor() {
    this.email_notify_service = new EmailNotificationService();
    this.sms_notify_service = new SmsNotificationService();
  }

  async send(
    user: UserModel,
    data: ExternalNotificationPayload,
  ): Promise<ResponseModel> {
    try {
      const { method } = data;

      if (method == EXTERNAL_NOTIFICATION_METHOD.EMAIL) {
        return this.email_notify_service.send(user, data);
      } else if (method == EXTERNAL_NOTIFICATION_METHOD.SMS) {
        return this.sms_notify_service.send(user, data);
      } else {
        throw new BadRequestException(
          errorResponse(__('Invalid notification method!')),
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
}
