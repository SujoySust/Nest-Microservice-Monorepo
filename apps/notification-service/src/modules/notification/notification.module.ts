import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { InternalNotificationModule } from './internal/internal.notification.module';
import { ExternalNotificationModule } from './external/external.notification.module';

@Module({
  imports: [InternalNotificationModule, ExternalNotificationModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
