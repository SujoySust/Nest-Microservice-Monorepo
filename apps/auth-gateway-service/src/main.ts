import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  await app.listen(process.env.AUTH_GATEWAY_SERVICE_PORT);
}
bootstrap();
