import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PostgresService } from '../../../../libs/prisma/src/postgres.service';
import { MongoService } from '../../../../libs/prisma/src/mongo.service';

export let app: NestExpressApplication | INestApplication;
export let postgres_client: PostgresService;
export let mongo_client: MongoService;

export function setApp(nestapp: NestExpressApplication | INestApplication) {
  app = nestapp;
  postgres_client = app.get(PostgresService);
  mongo_client = app.get(MongoService);
}
