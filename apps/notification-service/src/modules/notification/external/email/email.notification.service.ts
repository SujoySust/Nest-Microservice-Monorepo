import { Injectable } from '@nestjs/common';

import { NotificationInterface } from '../../notification.interface';

import { NotificationData } from '../../dto/response.dto';

import {
  EXTERNAL_NOTIFICATION_METHOD,
  NOTIFICATION_EVENTS,
  NOTIFICATION_TYPE,
} from '../../../../helpers/notification.constants';
import { app } from '../../../../helpers/notification.functions';
import { ExternalNotificationPayload } from '../../dto/input.dto';
import { StaffForgotPasswordNotification } from './staff/staff_forgot_password.notification';
import { EventNotification } from './user/event.notification';
import { ForgotPasswordMailNotification } from './user/forgot_password_mail_notification';
import { __ } from '@squareboat/nestjs-localization';
import { USER_TYPE } from '../../../../../../../libs/helpers/common/common.constant';
import { successResponse } from '../../../../../../../libs/helpers/rest/rest.functions';
import {
  UserModel,
  ResponseModel,
} from '../../../../../../../libs/helpers/rest/rest.types';
import { NotificationDataInterface } from '../../../../lib/mail/messages/message.interface';
import { NotificationLibService } from '../../../../lib/notification/notification.lib.service';
@Injectable()
export class EmailNotificationService
  implements NotificationInterface<ExternalNotificationPayload>
{
  async send(
    user: UserModel,
    data: ExternalNotificationPayload,
  ): Promise<ResponseModel> {
    const { event, notify_data, user_type } = data;

    const _email_data: NotificationData =
      notify_data[NOTIFICATION_TYPE.EXTERNAL][
        EXTERNAL_NOTIFICATION_METHOD.EMAIL
      ];

    const email_data: NotificationDataInterface = {
      subject: _email_data.title,
      title: _email_data.title,
      description: _email_data.description,
    };

    if (user_type == USER_TYPE.USER) {
      await this.sendUserNotificaiton(user, event, email_data);
    } else if (user_type == USER_TYPE.STAFF) {
      await this.sendStaffNotificaiton(user, event, email_data);
    }

    return successResponse(__('Email sent successfully!'));
  }

  private async sendUserNotificaiton(
    user: UserModel,
    event: NOTIFICATION_EVENTS,
    data: NotificationDataInterface,
  ) {
    const notify_lib_service = app.get(NotificationLibService);
    if (event == NOTIFICATION_EVENTS.RESET_PASSWORD) {
      await notify_lib_service.send(
        new ForgotPasswordMailNotification(data),
        user,
      );
    } else {
      await notify_lib_service.send(new EventNotification(data), user);
    }
  }

  private async sendStaffNotificaiton(
    staff: UserModel,
    event: NOTIFICATION_EVENTS,
    data: NotificationDataInterface,
  ) {
    const notify_lib_service = app.get(NotificationLibService);

    if (event == NOTIFICATION_EVENTS.RESET_PASSWORD) {
      await notify_lib_service.send(
        new StaffForgotPasswordNotification(data),
        staff,
      );
    } else {
      await notify_lib_service.send(new EventNotification(data), staff);
    }
  }
}
