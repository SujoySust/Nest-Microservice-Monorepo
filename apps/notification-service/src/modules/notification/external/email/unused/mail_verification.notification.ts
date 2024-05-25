import { Type } from '@nestjs/common';
import { User } from '@prisma/client';
import { MessageInterface } from '../../../../../../libs/mail/messages/message.interface';
import { ChannelInterface } from '../../../../../../libs/notification/channels/channel.interface';
import { MailChannel } from '../../../../../../libs/notification/channels/mail.channel';
import { NotificationLibInterface } from '../../../../../../libs/notification/notification.lib.interface';
import { NotificationTemplate } from '../../../../../../libs/notification/notification.lib.template';
import {
  emailSubjectAppName,
  fakeTrans,
} from '../../../../../helpers/notification.functions';

export class MailVerificationNotification implements NotificationLibInterface {
  data: any;
  constructor(data) {
    this.data = data;
  }

  broadcastOn(): Type<ChannelInterface>[] {
    return [MailChannel];
  }

  async toMail(notifiable: User): Promise<MessageInterface> {
    return (
      await NotificationTemplate.toEmail('verify_email.html', {
        subject:
          (await emailSubjectAppName()) + ' ' + fakeTrans('Email Verification'),
        name: `${notifiable.nickname || notifiable.usercode}`,
        email: notifiable.email,
        verification_code: this.data.verification_code,
      })
    ).to(notifiable.email);
  }

  queueable(): boolean {
    return false;
  }
}
