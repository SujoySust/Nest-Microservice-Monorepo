import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [NotificationModule, OtpModule],
  controllers: [],
  providers: [],
})
export class NotificationServiceModule {}
