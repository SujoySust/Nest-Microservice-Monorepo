import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserActivityService } from '../../app/modules/activity/user_activity.service';

import { SecurityConfig } from '../../configs/config.interface';
import { JwtHelper } from './jwt.helper';
import { JwtStrategy } from './jwt.strategy';
import { PasswordService } from './password.service';
import { User } from '../../app/models/db/user.model';
import { F_DeviceVerificationService } from '../../app/modules/auth/user/user.device.verification.service';

@Module({
  imports: [
    User,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: securityConfig.accessSecret,
          signOptions: {
            expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    JwtHelper,
    PasswordService,
    // GoogleAuthenticationService,
    F_DeviceVerificationService,
    UserActivityService,
    // GeeTestCaptchaService,
  ],
  exports: [
    JwtHelper,
    PasswordService,
    // GoogleAuthenticationService,
    F_DeviceVerificationService,
    UserActivityService,
  ],
})
export class AuthLibraryModule {}
