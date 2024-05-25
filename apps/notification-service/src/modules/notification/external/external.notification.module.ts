import { Module } from '@nestjs/common';
import { EmailNotificationService } from './email/email.notification.service';
import { SmsNotificationService } from './sms/sms.notification.service';
import { ExternalNotificationService } from './external.notification.service';

@Module({
  imports: [],
  providers: [
    ExternalNotificationService,
    EmailNotificationService,
    SmsNotificationService,
  ],
})
export class ExternalNotificationModule {}
