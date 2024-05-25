import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

//
export let app: NestExpressApplication | INestApplication;

export function setApp(nestapp: NestExpressApplication | INestApplication) {
  app = nestapp;
}
