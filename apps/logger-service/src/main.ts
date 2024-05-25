import { NestFactory } from '@nestjs/core';
import { LoggerServiceModule } from './logger-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LoggerServiceModule);
  await app.listen(3000);
}
bootstrap();
