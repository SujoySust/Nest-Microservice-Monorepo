import { Type } from '@nestjs/common';
import {
  emailSubjectAppName,
  fakeTrans,
} from '../../../../../../../../libs/helpers/common/common.functions';
import { User } from '../../../../../../../../libs/prisma/postgres/clients';
import { MessageInterface } from '../../../../../lib/mail/messages/message.interface';
import { ChannelInterface } from '../../../../../lib/notification/channels/channel.interface';
import { MailChannel } from '../../../../../lib/notification/channels/mail.channel';
import { NotificationLibInterface } from '../../../../../lib/notification/notification.lib.interface';
import { NotificationTemplate } from '../../../../../lib/notification/notification.lib.template';

export class EmailOtpVerificationNotification
  implements NotificationLibInterface
{
  data: any;
  constructor(data) {
    this.data = data;
  }

  broadcastOn(): Type<ChannelInterface>[] {
    return [MailChannel];
  }

  async toMail(notifiable: User): Promise<MessageInterface> {
    return await NotificationTemplate.toEmail('otp_email.html', {
      subject:
        (await emailSubjectAppName()) +
        ' ' +
        (this.data.subject || fakeTrans('OTP Verification')),
      name: `${notifiable.nickname || notifiable.usercode}`,
      email: notifiable.email,
      title: this.data.title || 'OTP',
      verification_code: this.data.verification_code,
      event_message: this.data.event_message,
    });
  }

  queueable(): boolean {
    return false;
  }
}
