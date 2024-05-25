import { Module } from '@nestjs/common';
import { NotificationLibService } from '../../../libs/notification/notification.lib.service';
import { OtpLibService } from '../../../libs/otp/otp.lib.service';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
  controllers: [OtpController],
  providers: [OtpService, OtpLibService, NotificationLibService],
})
export class OtpModule {}
