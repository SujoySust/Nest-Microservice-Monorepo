import { ConfigModule } from '@nestjs/config';
import { LocalizationModule } from '@squareboat/nestjs-localization';
import { join } from 'path';

export function TestModuleDependecy() {
  return [
    LocalizationModule.register({
      path: join(process.env.BASE_PROJECT_PATH ?? '', 'resources/lang/'),
      fallbackLang: 'en',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        // CorsConfig,
        // AppConfig,
        // GraphQLConfig,
        // AuthConfig,
        // JWTConfig,
        // QueueConfig,
        // FilesystemConfig,
        // MailConfig,
        // CacheConfig,
        // ServicesConfig,
      ],
    }),
  ];
}
