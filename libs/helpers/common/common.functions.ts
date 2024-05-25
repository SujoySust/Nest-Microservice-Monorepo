import { __ as trans } from '@squareboat/nestjs-localization';
import { MongoService, PostgresService } from '../../prisma/src';
import { NestExpressApplication } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import { RedisPubSubService } from '../../../apps/auth-gateway-service/src/lib/pubsub/redis_pub_sub.service';

export let app: NestExpressApplication | INestApplication;
export let redis_pub_sub: RedisPubSubService;
export let postgres_client: PostgresService;
export let mongo_client: MongoService;

export function setApp(nestapp: NestExpressApplication | INestApplication) {
  app = nestapp;
  postgres_client = app.get(PostgresService);
  mongo_client = app.get(MongoService);
}

export function getAppKey() {
  return process.env.APP_KEY || 'AppKeyShouldBeMinimum16Characters';
}

export async function appName(): Promise<string> {
  return process.env.APP_NAME ?? '';
}

export function base_url() {
  return cleanTrailingSlash(process.env.APP_URL ?? '');
}

export function frontend_app_url() {
  return cleanTrailingSlash(process.env.USER_FRONTEND_APP_URL ?? '');
}

export function frontend_app_domain() {
  return frontend_app_url().replace('https://', '').replace('http://', '');
}

export function initCoreServices() {
  //
}

Number.prototype['noExponents'] = function () {
  const data = String(this).split(/[eE]/);
  if (data.length == 1) return data[0];

  let z = '';
  const sign = this < 0 ? '-' : '';
  const str = data[0].replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + '0.';
    while (mag++) z += '0';
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  while (mag--) z += '0';
  return str + z;
};

BigInt.prototype['noExponents'] = function () {
  const data = String(this).split(/[eE]/);
  if (data.length == 1) return data[0];

  let z = '';
  const sign = this < 0 ? '-' : '';
  const str = data[0].replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + '0.';
    while (mag++) z += '0';
    return z + str.replace(/^\-/, '');
  }
  mag -= str.length;
  while (mag--) z += '0';
  return str + z;
};

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

export function noExponents(value: any): string {
  return Number(value)['noExponents']();
}

export function getRandomInt(length: number, skip_int?: number) {
  let result = '';
  let characters = '0123456789';
  if (skip_int >= 0) {
    characters = characters.replace(skip_int.toString(), '');
  }
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

  /* let init_number = 1;
    let multiply_number = 9;
    for (let i = 1; i < digit; i++) {
      init_number *= 10;
      multiply_number *= 10;
    }
    return Math.floor(
      Math.random() * init_number + Math.random() * multiply_number,
    ); */
}

export function empty(value: any): boolean {
  if (value == null || value == undefined) return true;
  return false;
}

export function diff_minutes(dt2: Date, dt1: Date) {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}

export function diff_seconds(dt2: Date, dt1: Date) {
  const diff = (dt2.getTime() - dt1.getTime()) / 1000;
  return Math.abs(Math.round(diff));
}

export function __(key: string, lang?: string) {
  try {
    return trans(key, lang || global.lang).replace('ERR::INVALID KEY ==> ', '');
  } catch (e) {
    // console.error(e.stack);
    return key;
  }
}

export function fakeTrans(key: string) {
  return key;
}

export function lcfirst(str) {
  str += '';
  const f = str.charAt(0).toLowerCase();
  return f + str.substr(1);
}

export function ucfirst(str) {
  str += '';
  const f = str.charAt(0).toUpperCase();
  return f + str.substr(1);
}

export function cleanTrailingSlash(str: string) {
  return str.replace(/\/$/g, '');
}

export function cleanBeginingSlash(str: string) {
  return str.replace(/^\//g, '');
}

export function cleanBothEndSlash(str: string) {
  return str.replace(/^\/+|\/+$/g, '');
}

export function addMinutes(date: Date | string, minutes: number): Date {
  return new Date(new Date(date).getTime() + minutes * 60000);
}

export function subMinutes(date: Date | string, minutes: number): Date {
  return new Date(new Date(date).getTime() - minutes * 60000);
}

export function addSeconds(date: Date | string, seconds: number): Date {
  return new Date(new Date(date).getTime() + seconds * 1000);
}

export function subSeconds(date: Date | string, seconds: number): Date {
  return new Date(new Date(date).getTime() - seconds * 1000);
}

export async function emailSubjectAppName(): Promise<string> {
  const app_name = await appName();
  return app_name ? '[' + app_name + ']' : '';
}

export function getProtectedEmail(email: string): string {
  if (!email) return null;
  const splitedEmail = email.split('@');
  return (
    splitedEmail[0].replace(/(.{2})(.*)(?=.{2})/, function (gp1, gp2, gp3) {
      for (let i = 0; i < gp3.length; i++) {
        gp2 += '*';
      }
      return gp2;
    }) + (splitedEmail[1] ? `@${splitedEmail[1]}` : '')
  );
}

export function getProtectedPhone(phone: string): string {
  if (!phone) return null;
  return phone.replace(/(.{3})(.*)(?=.{3})/, function (gp1, gp2, gp3) {
    for (let i = 0; i < gp3.length; i++) {
      gp2 += '*';
    }
    return gp2;
  });
}

export function getApiErrMsg(e: any) {
  return (
    e.data?.message || e.message || e.stack || JSON.stringify(e) || e.toString()
  );
}

export function cleanMultiSlash(endpoint, replaceWith = '/') {
  endpoint = endpoint.replace(/\/{2,}/g, replaceWith);
  return endpoint;
}

export async function getSettingValByKey(
  key_or_slug: string,
  prisma?: PostgresService | null,
): Promise<string> {
  prisma = prisma ? prisma : postgres_client;
  const setting = await prisma.setting.findFirst({
    where: {
      option_key: key_or_slug,
    },
  });
  return setting ? setting.option_value : '';
}

export async function getSettingsGroup(
  group_names?: string[],
  key_or_slugs?: string[],
  prisma?: PostgresService,
) {
  prisma = prisma ? prisma : postgres_client;
  const setting = await prisma.setting.findMany({
    where: {
      OR: [
        {
          option_group: {
            in: group_names,
          },
        },
        {
          option_key: {
            in: key_or_slugs,
          },
        },
      ],
    },
  });
  let settingObj = {};
  if (setting) {
    settingObj = setting.reduce(
      (acc, cur) => ({ ...acc, [cur.option_key]: cur.option_value }),
      {},
    );
  }
  return settingObj;
}
