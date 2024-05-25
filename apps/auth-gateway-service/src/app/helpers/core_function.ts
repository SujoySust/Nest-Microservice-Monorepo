import {
  BadRequestException,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { __ as trans } from '@squareboat/nestjs-localization';
import { RedisPubSubService } from '../../lib/pubsub/redis_pub_sub.service';
import { ResponseModel } from '../models/custom/common.response.model';
import { PrismaClient } from '@prisma/client';
import { User } from '../models/db/user.model';
import { Staff } from '../models/db/staff.model';
import { CODE, COMMON_STATUS, DEVICE_TYPE, USER_STATUS } from './core_constant';
import {
  STAFF_SOCKET_IDS,
  USER_SOCKET_IDS,
} from '../../configs/graphql.config';
import { MongoService, PostgresService } from '../../../../../libs/prisma/src';
import { randomUUID } from 'crypto';
import { IpLocationModel } from '../models/db/ip_location.model';
import { DEVICE_TYPES_FOR_MOBILE, countryList } from './core_objects';
import DeviceDetector, { DeviceDetectorResult } from 'device-detector-js';

export let app: NestExpressApplication | INestApplication;
export let redis_pub_sub: RedisPubSubService;
export let postgres_client: PostgresService;
export let mongo_client: MongoService;

export function setApp(nestapp: NestExpressApplication | INestApplication) {
  app = nestapp;
  postgres_client = app.get(PostgresService);
  mongo_client = app.get(MongoService);
}

export function initCoreServices() {
  redis_pub_sub = app.get(RedisPubSubService);
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

export function lcfirst(str: string) {
  str += '';
  const f = str.charAt(0).toLowerCase();
  return f + str.substring(1);
}

export function processException(e) {
  checkPrismaError(e);
  if (
    (e.hasOwnProperty('response') &&
      !e.response.hasOwnProperty('success') &&
      !e.response.hasOwnProperty('data')) ||
    !e.hasOwnProperty('response')
  ) {
    console.error(e.stack);
  }
  throw e;
}

function checkPrismaError(e) {
  /* if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    const field = e.meta['target'][0];
    if (field === 'email')
      throw new ConflictException(__(`Email already used.`));
    if (field === 'phone')
      throw new ConflictException(__(`Phone number already used.`));
    else {
      console.error(e.stack);
      throw new Error(__('Something went wrong. Please try again after some time.'));
    }
  } else */

  if (
    e.message?.includes('SqlState(E22003)') ||
    e.message?.includes(
      'A number used in the query does not fit into a 64 bit signed integer',
    )
  ) {
    // console.log(e.stack, LOG_LEVEL_ERROR, undefined, undefined, 5);
    throw new BadRequestException(
      errorResponse(__('Number field maximum limit exceeded')),
    );
  } else if (
    String(e.message)?.search(/Unknown argument.*? Did you mean/) >= 0
  ) {
    //
    let msg = __('Invalid sort or orderBy column name');
    const parseCol = e.message.match(/Unknown argument \`.*?\`/);
    if (parseCol?.length) {
      const wrongColName = String(parseCol[0]).replace('Unknown argument ', '');
      msg += `: ${wrongColName}`;
    }
    throw new BadRequestException(errorResponse(msg));
    //
  } else if (
    e instanceof PrismaClient.PrismaClientKnownRequestError ||
    e instanceof PrismaClient.PrismaClientUnknownRequestError ||
    e instanceof PrismaClient.PrismaClientValidationError ||
    e instanceof PrismaClient.PrismaClientInitializationError ||
    e instanceof PrismaClient.PrismaClientRustPanicError
  ) {
    // console.log(e.stack, LOG_LEVEL_ERROR, undefined, undefined, 5);
    throw new Error(
      __('Something went wrong. Please try again after some time.'),
    );
  }
}

export function successResponse(
  msg?: string,
  data?: object,
  code?: number,
): ResponseModel {
  return {
    success: true,
    message: msg ?? '',
    data: data || null,
    code: code || 200,
  };
}

export function errorResponse(
  msg?: string,
  data?: object,
  code?: number,
  messages?: string[],
): ResponseModel {
  return {
    success: false,
    message:
      msg || __('Something went wrong. Please try again after some time.'),
    messages: messages ?? [],
    data: data || null,
    code: code || 500,
  };
}

export function get_online_status(
  user_type: 'user' | 'staff',
  user: Partial<User | Staff>,
): number {
  let status = COMMON_STATUS.STATUS_ACTIVE;
  if (user_type == 'user' && USER_SOCKET_IDS[Number(user.id)]?.length > 0) {
    status = COMMON_STATUS.STATUS_ACTIVE;
  } else if (
    user_type == 'staff' &&
    STAFF_SOCKET_IDS[Number(user.id)]?.length > 0
  ) {
    status = COMMON_STATUS.STATUS_ACTIVE;
  }
  return status;
}

export function uniqueCode(prefix?: string, suffix?: string): string {
  return (prefix || '') + String(Date.now()) + (suffix || '');
}

export function createUserCode(): string {
  return uniqueCode('u-');
}

export function getUUID(withSlash = false) {
  let id: string = randomUUID();
  if (!withSlash) id = id.replace(/-/gi, '');
  return id;
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

export function validateUserAccountAndThrowErr(user: any) {
  if (!user) {
    throw new NotFoundException(errorResponse(__(`No user found`)));
  }
  if (user.status == USER_STATUS.SUSPENDED) {
    throw new UnauthorizedException(
      errorResponse(
        __('Your account is suspended. Contact to support.'),
        null,
        CODE.USER_SUSPENDED,
      ),
    );
  } else if (user.status == USER_STATUS.DISABLED) {
    throw new UnauthorizedException(
      errorResponse(
        __('Your account is disabled. Contact to support.'),
        null,
        CODE.USER_DISABLED,
      ),
    );
  } else if (user.status != USER_STATUS.ACTIVE) {
    throw new UnauthorizedException(
      errorResponse(
        __('Your account is not active. Contact to support.'),
        null,
        CODE.ACCOUNT_NOT_ACTIVE,
      ),
    );
  }
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

export function getLocation(ipLocation: IpLocationModel): string {
  if (!ipLocation) return '';
  let location = '';
  if (ipLocation.city) location += ipLocation.city;
  if (ipLocation.region && ipLocation.region != ipLocation.city)
    location += `, ${ipLocation.region}`;
  if (ipLocation.country_code)
    location += `, ${getCountry(ipLocation.country_code.toUpperCase()) ?? ''}`;
  return location;
}

export function getCountry(input: string = null) {
  if (input != null) {
    return countryList[input];
  } else {
    return countryList;
  }
}

export function parseDeviceInfo(userAgent: string): DeviceDetectorResult {
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(userAgent);
  if (device?.client?.type === 'mobile app' && userAgent.search(/CSTMN/) >= 0) {
    const appName = userAgent.match(/CSTMN:(.*?);/)[1] || '';
    device.client.name = appName;
  }
  return device;
}

export function detectDeviceType({
  userAgent,
  device,
}: {
  userAgent?: string;
  device?: DeviceDetectorResult;
}): string {
  device = device ?? parseDeviceInfo(userAgent);
  let device_type = device?.device?.type ?? 'unknown';
  if (DEVICE_TYPES_FOR_MOBILE.includes(<any>device_type))
    device_type = DEVICE_TYPE.MOBILE;
  return device_type;
}

export function detectMobileApp({
  userAgent,
  device,
}: {
  userAgent?: string;
  device?: DeviceDetectorResult;
}): boolean {
  device = device ?? parseDeviceInfo(userAgent);
  const device_type = device?.device?.type ?? undefined;
  if (
    device_type &&
    device_type != DEVICE_TYPE.DESKTOP &&
    device?.client?.type != 'browser'
  ) {
    return true;
  }
  return false;
}

export function checkStatusAndGetUser(user: any) {
  if (user.status == USER_STATUS.ACTIVE) return user;
  else if (user.status == USER_STATUS.SUSPENDED)
    throw new UnauthorizedException(
      errorResponse(
        __('The account is suspended. Contact to support'),
        null,
        CODE.USER_SUSPENDED,
      ),
    );
  else if (user.status == USER_STATUS.DISABLED)
    throw new UnauthorizedException(
      errorResponse(
        __('The account is disabled. Contact to support'),
        null,
        CODE.USER_DISABLED,
      ),
    );
  else if (user.status == USER_STATUS.INACTIVE)
    throw new UnauthorizedException(
      errorResponse(
        __('The account is not active. Contact to support'),
        null,
        CODE.ACCOUNT_NOT_ACTIVE,
      ),
    );
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
