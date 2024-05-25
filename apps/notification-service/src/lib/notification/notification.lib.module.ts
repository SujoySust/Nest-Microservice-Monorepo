import { Global, Module } from '@nestjs/common';
import { NotificationLibService } from './notification.lib.service';

@Global()
@Module({
  providers: [NotificationLibService],
  exports: [NotificationLibService],
})
export class NotificationLibModule {}
