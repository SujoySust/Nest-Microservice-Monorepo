import { Module } from '@nestjs/common';
import { InternalNotificationService } from './internal.notification.service';
import { StaffNotificationService } from './staff.notification.service';
import { UserNotificationService } from './user.notification.service';

@Module({
  imports: [],
  providers: [
    InternalNotificationService,
    UserNotificationService,
    StaffNotificationService,
  ],
})
export class InternalNotificationModule {}
