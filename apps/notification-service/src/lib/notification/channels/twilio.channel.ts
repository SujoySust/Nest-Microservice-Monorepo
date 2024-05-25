import { ChannelInterface } from './channel.interface';
import { NotificationLibInterface } from '../notification.lib.interface';
import { UserModel } from '../../../../../../libs/helpers/rest/rest.types';

export class TwilioChannel implements ChannelInterface {
  send(
    notifiable: UserModel,
    notification: NotificationLibInterface,
  ): Promise<void> {
    return Promise.resolve(undefined);
  }
}
