import { Global, Module } from '@nestjs/common';
import { OtpLibService } from './otp.lib.service';
import { EmailLibService } from './email.lib.service';

@Global()
@Module({
  providers: [EmailLibService, OtpLibService],
  exports: [OtpLibService],
})
export class OtpLibModule {}
