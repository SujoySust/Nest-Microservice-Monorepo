import {
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RedisPubSubService } from '../../lib/pubsub/redis_pub_sub.service';
import { User } from '../models/db/user.model';
import { Staff } from '../models/db/staff.model';
import {
  STAFF_SOCKET_IDS,
  USER_SOCKET_IDS,
} from '../../configs/graphql.config';
import { MongoService, PostgresService } from '../../../../../libs/prisma/src';
import { randomUUID } from 'crypto';
import { IpLocationModel } from '../models/db/ip_location.model';
import DeviceDetector, { DeviceDetectorResult } from 'device-detector-js';
import { DEVICE_TYPE, USER_STATUS } from './core_constant';
import { errorResponse } from '../../../../../libs/helpers/graphql/graphql.functions';
import { __ } from '../../../../../libs/helpers/common/common.functions';
import {
  CODE,
  COMMON_STATUS,
} from '../../../../../libs/helpers/common/common.constant';
import { DEVICE_TYPES_FOR_MOBILE } from './core_objects';
import { COUNTRY_LIST } from '../../../../../libs/helpers/common/common.objects';

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
    return COUNTRY_LIST[input];
  } else {
    return COUNTRY_LIST;
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
