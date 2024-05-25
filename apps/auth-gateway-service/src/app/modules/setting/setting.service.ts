import { Injectable } from '@nestjs/common';
import { Setting } from '../../models/db/setting.model';

import { PrismaClient } from '@prisma/client';

import { __ } from '@squareboat/nestjs-localization';
import { postgres_client } from '../../helpers/core_function';
import {
  SETTINGS_SLUG,
  SETTINGS_VALUE_TYPE,
} from '../../../../../../libs/helpers/common/common.slugs';
import {
  processException,
  successResponse,
} from '../../../../../../libs/helpers/graphql/graphql.functions';
import { COMMON_STATUS } from '../../../../../../libs/helpers/common/common.constant';

@Injectable()
export class SettingService {
  private imageSlugList: any = [
    SETTINGS_SLUG.APP_LOGO_LARGE,
    SETTINGS_SLUG.APP_LOGO_SMALL,
    SETTINGS_SLUG.FAVICON_LOGO,
    SETTINGS_SLUG.META_IMAGE_URL,
  ];
  async insertOrUpdateSettings(data: any) {
    const setting = await postgres_client.setting.findFirst({
      where: {
        option_group: data.option_group,
        option_key: data.option_key,
      },
    });
    if (setting) {
      await postgres_client.setting.update({
        where: {
          id: setting.id,
        },
        data: data,
      });
    } else {
      await postgres_client.setting.create({
        data: data,
      });
    }
  }

  async settingSave(payload: any, group: string) {
    try {
      for (const property in payload) {
        if (this.imageSlugList.includes(property)) {
          const image = await payload[property];
          if (image) {
            // const imageUrl = await uploadImage(
            //   image,
            //   image_path ?? 'application/settings',
            // );
            const imageUrl = ''; // TODO: implement image upload function
            if (imageUrl) {
              await this.insertOrUpdateSettings({
                value_type: SETTINGS_VALUE_TYPE.MEDIA_URL,
                option_group: group,
                option_key: property,
                option_value: imageUrl,
              });
            }
          }
        } else {
          await this.insertOrUpdateSettings({
            value_type: SETTINGS_VALUE_TYPE.TEXT,
            option_group: group,
            option_key: property,
            option_value: payload[property],
          });
        }
      }
      return successResponse(__('Settings saved successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  async getSettingsData(
    option_group: string[],
    slug?: string[],
    checkClientAccess?: boolean,
    prisma?: PrismaClient,
  ): Promise<Setting[]> {
    try {
      const prismaClient = prisma ?? postgres_client;
      return await prismaClient.setting.findMany({
        where: {
          OR: [
            {
              option_group:
                option_group?.length > 0
                  ? {
                      in: option_group,
                    }
                  : undefined,
            },
            {
              option_key:
                slug?.length > 0
                  ? {
                      in: slug,
                    }
                  : undefined,
            },
          ],
          client_access: checkClientAccess
            ? COMMON_STATUS.STATUS_ACTIVE
            : undefined,
        },
      });
    } catch (e) {
      processException(e);
    }
  }

  async getSettingsObjectData(option_group: any[], prisma?: PrismaClient) {
    try {
      const settings = await this.getSettingsData(
        option_group,
        [],
        false,
        prisma,
      );
      let settingObj = {};
      if (settings && settings.length > 0) {
        settingObj = settings.reduce(
          (acc: any, cur: any) => ({
            ...acc,
            [cur.option_key]: cur.option_value,
          }),
          {},
        );
      }
      return settingObj;
    } catch (e) {
      processException(e);
    }
  }
}
