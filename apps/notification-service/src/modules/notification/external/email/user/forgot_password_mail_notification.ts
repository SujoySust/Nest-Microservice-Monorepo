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

// import { User } from '../../../models/db/user.model';

export class ForgotPasswordMailNotification
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
    return (
      await NotificationTemplate.toEmail('reset_password.html', {
        subject:
          (await emailSubjectAppName()) + ' ' + fakeTrans('Reset Password'),
        title: fakeTrans('Reset Password'),
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
