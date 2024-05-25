import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { DefaultArgs } from '@prisma/client/runtime/library';
import { IpLocationService } from '../../../core.services/ip_location.service';
import { User } from '../../../models/db/user.model';
import { UserActivityService } from '../../activity/user_activity.service';
import { __ } from '@squareboat/nestjs-localization';

import {
  Prisma,
  PrismaClient,
  UserDevices,
} from '../../../../../../../libs/prisma/postgres/clients';

import { LoginResponse } from '../../../../lib/auth/models/login_response.model';
import {
  COMMON_STATUS,
  ACTIVITY_EVENT,
  ACTIVITY,
  CODE,
} from '../../../helpers/core_constant';
import {
  postgres_client,
  parseDeviceInfo,
  detectDeviceType,
  getUUID,
  errorResponse,
  successResponse,
  getLocation,
} from '../../../helpers/core_function';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');
@Injectable()
export class F_DeviceVerificationService {
  constructor(
    private readonly ipLocationService: IpLocationService,
    private readonly activityService: UserActivityService,
  ) {}

  async getDeviceByToken(
    deviceToken: string,
    userId?: bigint,
    loginSecret?: string,
  ) {
    return await postgres_client.userDevices.findFirst({
      where: {
        device_token: deviceToken,
        status: COMMON_STATUS.STATUS_ACTIVE,
        user_id: userId || undefined,
        login_secret: loginSecret || undefined,
      },
    });
  }

  async createNewUserDevice(
    req: Request,
    user: User,
    loginSecret?: string,
    loginSecretExpireAt?: Date,
  ) {
    const deviceExpiresIn = new Date(
      new Date().valueOf() + ms(process.env.DEVICE_TOKEN_EXPIRY || '360 days'),
    );
    const userAgent = req.header('User-Agent');
    const device = parseDeviceInfo(userAgent);
    const device_type = detectDeviceType({ device });
    const location = getLocation(
      await this.ipLocationService.getOrCreateIpLocation(req.ip),
    );

    const newDevice = await postgres_client.userDevices.create({
      data: {
        user_id: user.id,
        device_type: device_type,
        login_secret: loginSecret,
        login_secret_expires_at: loginSecretExpireAt,
        device_token: getUUID(),
        device_token_expires_at: deviceExpiresIn,
        device_info: JSON.stringify(device),
        user_agent: userAgent,
        ip_address: req.ip,
        location: location,
        status: COMMON_STATUS.STATUS_ACTIVE,
      },
    });

    this.activityService.createUserActivity(
      user.id,
      req,
      ACTIVITY_EVENT.SECURITY,
      ACTIVITY.NEW_DEVICE_VERIFICATION,
      COMMON_STATUS.STATUS_ACTIVE,
    );

    return newDevice;
  }

  async updateUserDevice(
    id: bigint,
    data: Prisma.UserDevicesUpdateInput,
  ): Promise<UserDevices> {
    return await postgres_client.userDevices.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  async expireUserDevice(id: bigint): Promise<UserDevices> {
    return await postgres_client.userDevices.update({
      where: {
        id: id,
      },
      data: {
        status: COMMON_STATUS.STATUS_EXPIRED,
        login_secret: null,
        login_secret_expires_at: null,
      },
    });
  }

  async createOrUpdateUserDevice(
    user: User,
    req: Request,
    loginSecret?: string,
    loginSecretExpireAt?: Date,
    deviceToken?: string,
  ): Promise<UserDevices> {
    if (deviceToken) {
      const checkDevice = await this.checkDeviceToken(user.id, deviceToken);
      if (checkDevice) {
        return this.updateUserDevice(checkDevice.id, {
          login_secret: loginSecret,
          login_secret_expires_at: loginSecretExpireAt,
        });
      }
    }
    return this.createNewUserDevice(
      req,
      user,
      loginSecret,
      loginSecretExpireAt,
    );
  }

  async userDeviceVerificationCheck(
    user: User,
    deviceToken?: string,
  ): Promise<LoginResponse> {
    if (user?.setting?.device_check_enabled === COMMON_STATUS.STATUS_ACTIVE) {
      if (!deviceToken) {
        return {
          ...errorResponse(__('Verify your device.'), null, CODE.VERIFY_DEVICE),
          user,
        };
      }
      if (!(await this.checkDeviceToken(user.id, deviceToken))) {
        const device = await this.getDeviceByToken(deviceToken);
        if (device) await this.expireUserDevice(device.id);
        return {
          ...errorResponse(__('Verify your device.'), null, CODE.VERIFY_DEVICE),
          user,
        };
      }
    } else if (
      deviceToken &&
      !(await this.checkDeviceToken(user.id, deviceToken))
    ) {
      const device = await this.getDeviceByToken(deviceToken);
      if (device) await this.expireUserDevice(device.id);
      deviceToken = null;
    }
    return { ...successResponse(''), deviceToken };
  }

  async checkDeviceToken(
    userId: bigint,
    deviceToken: string,
    loginSecret?: string,
  ): Promise<UserDevices | false> {
    const device = await this.getDeviceByToken(
      deviceToken,
      userId,
      loginSecret,
    );
    if (!device) return false;
    if (
      device &&
      new Date(device.device_token_expires_at).getTime() <= new Date().getTime()
    ) {
      await this.expireUserDevice(device.id);
      return false;
    }
    return device;
  }

  async deleteDevice(
    device_id: bigint,
    prisma?: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    prisma = prisma ?? postgres_client;
    return await prisma.userDevices.delete({
      where: {
        id: device_id,
      },
    });
  }

  async checkUserDevice(user: User, deviceToken: string, loginSecret: string) {
    if (!deviceToken) {
      if (user.setting.device_check_enabled === COMMON_STATUS.STATUS_ACTIVE) {
        throw new UnauthorizedException(
          errorResponse(
            __('Your device is not verified.'),
            null,
            CODE.VERIFY_DEVICE,
          ),
        );
      } else {
        throw new UnauthorizedException(
          errorResponse(__('Unauthorized'), null, CODE.UNAUTHORIZED),
        );
      }
    }
    if (await this.checkDeviceToken(user.id, deviceToken, loginSecret)) {
      return true;
    } else {
      if (user.setting.device_check_enabled === COMMON_STATUS.STATUS_ACTIVE) {
        throw new UnauthorizedException(
          errorResponse(
            __('Your device is not verified.'),
            null,
            CODE.VERIFY_DEVICE,
          ),
        );
      } else {
        throw new UnauthorizedException(
          errorResponse(__('Unauthorized'), null, CODE.UNAUTHORIZED),
        );
      }
    }
  }
}
