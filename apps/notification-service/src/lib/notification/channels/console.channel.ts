import { User } from '../../../../../../libs/prisma/postgres/clients';
import { NotificationLibInterface } from '../notification.lib.interface';
import { ChannelInterface } from './channel.interface';
// import { User } from '../../../app/models/db/user.model'; // TODO: will change it

export class ConsoleChannel implements ChannelInterface {
  send(
    notifiable: User,
    notification: NotificationLibInterface,
  ): Promise<void> {
    const data = this.getData(notifiable, notification);
    return Promise.resolve(console.log(data));
  }

  private getData(
    notifiable: User,
    notification: NotificationLibInterface,
  ): string {
    if (typeof notification['toConsole'] === 'function') {
      return notification['toConsole'](notifiable);
    }
    throw new Error('toConsole method is missing into Notification class');
  }
}
