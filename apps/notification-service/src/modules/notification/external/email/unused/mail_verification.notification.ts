import { Type } from '@nestjs/common';
import { NotificationLibInterface } from '../../../../../lib/notification/notification.lib.interface';
import {
  emailSubjectAppName,
  fakeTrans,
} from '../../../../../../../../libs/helpers/common/common.functions';
import { User } from '../../../../../../../../libs/prisma/postgres/clients';
import { MessageInterface } from '../../../../../lib/mail/messages/message.interface';
import { ChannelInterface } from '../../../../../lib/notification/channels/channel.interface';
import { MailChannel } from '../../../../../lib/notification/channels/mail.channel';
import { NotificationTemplate } from '../../../../../lib/notification/notification.lib.template';

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
