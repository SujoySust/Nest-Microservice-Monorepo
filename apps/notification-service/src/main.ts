import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './modules/notification-service.module';
import { setApp } from './helpers/notification.functions';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  setApp(app);
  await app.listen(process.env.NOTIFICATION_SERVICE_PORT);
}
bootstrap();
