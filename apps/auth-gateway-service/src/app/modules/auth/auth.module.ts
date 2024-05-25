import { Module } from '@nestjs/common';
import { UserActivityService } from '../activity/user_activity.service';
import { B_AuthResolver } from './staff/staff.auth.resolver';
import { B_AuthService } from './staff/staff.auth.service';
import { AppleAuthService } from './user/social/apple_auth.service';
import { GoogleAuthService } from './user/social/google_auth.service';
import { SocialAuthService } from './user/social/social_auth.service';
import { F_AuthResolver } from './user/user.auth.resolver';
import { F_AuthService } from './user/user.auth.service';
import { F_AuthValidationService } from './user/user.auth.validation.service';
import { F_DeviceVerificationService } from './user/user.device.verification.service';
import { AuthLibraryModule } from '../../../lib/auth/auth.library.module';

@Module({
  imports: [AuthLibraryModule],
  providers: [
    //backoffice
    B_AuthService,
    B_AuthResolver,
    //
    //frontend
    F_AuthService,
    F_AuthResolver,
    F_AuthValidationService,
    F_DeviceVerificationService,
    // F_UserService,
    UserActivityService,

    SocialAuthService,
    GoogleAuthService,
    AppleAuthService,
    //
  ],
  exports: [F_DeviceVerificationService],
})
export class AuthModule {}
