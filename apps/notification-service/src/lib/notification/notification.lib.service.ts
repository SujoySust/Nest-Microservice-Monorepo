import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ChannelInterface } from './channels/channel.interface';
import { NotificationLibInterface } from './notification.lib.interface';
import { UserModel } from '../../../../../libs/helpers/rest/rest.types';

@Injectable()
export class NotificationLibService {
  constructor(private moduleRef: ModuleRef) {}

  send(
    notification: NotificationLibInterface,
    notifiable: UserModel,
  ): Promise<any> {
    const channels = notification.broadcastOn();
    return Promise.all(
      channels.map(async (channel: Type<ChannelInterface>) => {
        const channelObj: ChannelInterface = await this.resolveChannel(channel);
        await channelObj.send(notifiable, notification);
      }),
    );
  }

  /**
   * Resolve the channel needed to send the Notification
   * @param channel
   * @return Promise<ChannelInterface>
   */
  private async resolveChannel(channel: Type<ChannelInterface>) {
    return this.moduleRef.create(channel);
  }
}
