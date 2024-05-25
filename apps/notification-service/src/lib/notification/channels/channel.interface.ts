import { UserModel } from '../../../../../../libs/helpers/rest/rest.types';
import { Staff } from '../../../../../../libs/prisma/postgres/clients';
import { NotificationLibInterface } from '../notification.lib.interface';

export interface ChannelInterface {
  send(
    notifiable: UserModel | Staff,
    notification: NotificationLibInterface,
  ): Promise<void>;
}
