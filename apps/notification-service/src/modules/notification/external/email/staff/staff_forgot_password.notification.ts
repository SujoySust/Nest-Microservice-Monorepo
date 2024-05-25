import { Type } from '@nestjs/common';
import {
  emailSubjectAppName,
  fakeTrans,
} from '../../../../../../../../libs/helpers/common/common.functions';
import { Staff } from '../../../../../../../../libs/prisma/postgres/clients';
import { MessageInterface } from '../../../../../lib/mail/messages/message.interface';
import { ChannelInterface } from '../../../../../lib/notification/channels/channel.interface';
import { MailChannel } from '../../../../../lib/notification/channels/mail.channel';
import { NotificationLibInterface } from '../../../../../lib/notification/notification.lib.interface';
import { NotificationTemplate } from '../../../../../lib/notification/notification.lib.template';

export class StaffForgotPasswordNotification
  implements NotificationLibInterface
{
  data: any;
  constructor(data) {
    this.data = data;
  }

  broadcastOn(): Type<ChannelInterface>[] {
    return [MailChannel];
  }

  async toMail(notifiable: Staff): Promise<MessageInterface> {
    return (
      await NotificationTemplate.toEmail(
        'reset_password.html',
        {
          subject:
            (await emailSubjectAppName()) + ' ' + fakeTrans('Reset Password'),
          title: fakeTrans('Reset Password'),
          name: notifiable.name,
          email: notifiable.email,
          verification_code: this.data.verification_code,
        },
        'staff',
      )
    ).to(notifiable.email);
  }

  queueable(): boolean {
    return false;
  }
}
