import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpLibService } from '../../lib/otp/otp.lib.service';
import { NotificationLibService } from '../../lib/notification/notification.lib.service';

@Module({
  controllers: [OtpController],
  providers: [OtpService, OtpLibService, NotificationLibService],
})
export class OtpModule {}
