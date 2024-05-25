import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { LocalizationModule } from '@squareboat/nestjs-localization';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { MailConfig } from './config/mail.config';
import { OtpLibModule } from './lib/otp/otp.lib.module';
import { NotificationLibModule } from './lib/notification/notification.lib.module';
import { NotificationServiceModule } from './modules/notification-service.module';
import { MailModule } from './lib/mail/mail.module';

@Global()
@Module({
  imports: [
    // Core Modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [MailConfig],
    }),
    LocalizationModule.register({
      path: process.env.BASE_PROJECT_PATH
        ? join(process.env.BASE_PROJECT_PATH, 'resources/lang/')
        : join(__dirname, '../..', 'resources/lang/'),
      fallbackLang: 'en',
    }),

    ThrottlerModule.forRoot({
      storage: new ThrottlerStorageRedisService({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DATABASE) || 0,
      }),
      throttlers: [
        {
          ttl: 60000,
          limit: Number(process.env.REQUEST_LIMIT_PER_MINUTE || 0) || 60,
        },
      ],
    }),

    MailModule,
    NotificationLibModule,
    OtpLibModule,
    HttpModule,
    NotificationServiceModule,
  ],
  controllers: [],

  exports: [HttpModule],
})
export class MainModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(localization, RequestAuthMiddleware).forRoutes('/');
  }
}
