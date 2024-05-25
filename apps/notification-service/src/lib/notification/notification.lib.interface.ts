import { Type } from '@nestjs/common';
import { ChannelInterface } from './channels/channel.interface';

export interface NotificationLibInterface {
  broadcastOn(): Type<ChannelInterface>[];
  queueable(): boolean;
}
