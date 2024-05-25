import { Type } from '@nestjs/common';
import {
  appName,
  emailSubjectAppName,
} from '../../../../../../../../libs/helpers/common/common.functions';
import { User } from '../../../../../../../../libs/prisma/postgres/clients';
import {
  NotificationDataInterface,
  MessageInterface,
} from '../../../../../lib/mail/messages/message.interface';
import { ChannelInterface } from '../../../../../lib/notification/channels/channel.interface';
import { MailChannel } from '../../../../../lib/notification/channels/mail.channel';
import { NotificationLibInterface } from '../../../../../lib/notification/notification.lib.interface';
import { NotificationTemplate } from '../../../../../lib/notification/notification.lib.template';

// import { User } from '../../../models/db/user.model';

export class EventNotification implements NotificationLibInterface {
  data: NotificationDataInterface;
  constructor(data: NotificationDataInterface) {
    this.data = data;
  }

  broadcastOn(): Type<ChannelInterface>[] {
    return [MailChannel];
  }

  async toMail(notifiable: User): Promise<MessageInterface> {
    const app_name = await appName();
    return await NotificationTemplate.toEmail('event.html', {
      subject:
        (await emailSubjectAppName()) +
        ' ' +
        (this.data.subject || app_name + ' Notification'),
      name: `${notifiable.nickname || notifiable.usercode}`,
      email: notifiable.email,
      title: this.data.title || app_name + ' Notification',
      description: this.data.description,
    });
  }

  queueable(): boolean {
    return false;
  }
}
