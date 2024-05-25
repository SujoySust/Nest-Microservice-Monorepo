import { ChannelInterface } from './channel.interface';
// import { User } from '../../../app/models/db/user.model'; // TODO: will change it
import { Injectable } from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { MessageInterface } from '../../mail/messages/message.interface';
import { NotificationLibInterface } from '../notification.lib.interface';
import { UserModel } from '../../../../../../libs/helpers/rest/rest.types';
import { Staff } from '../../../../../../libs/prisma/postgres/clients';
// import { Staff } from '../../../app/models/db/staff.model';

@Injectable()
export class MailChannel implements ChannelInterface {
  constructor(private readonly mailService: MailService) {}

  async send(
    notifiable: UserModel,
    notification: NotificationLibInterface,
  ): Promise<any> {
    const mailMessage: MessageInterface = await this.getData(
      notifiable,
      notification,
    );
    return this.mailService.send(
      mailMessage.to({
        name:
          notifiable['first_name'] !== undefined
            ? `${notifiable['first_name']} ${notifiable['last_name']}`
            : notifiable['username'],
        address: notifiable.email,
      }),
    );
  }

  private async getData(
    notifiable: UserModel | Staff,
    notification: NotificationLibInterface,
  ): Promise<MessageInterface> {
    if (typeof notification['toMail'] === 'function') {
      return notification['toMail'](notifiable);
    }
    throw new Error('toMail method is missing into Notification class');
  }
}
