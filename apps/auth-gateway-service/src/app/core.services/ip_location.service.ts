import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import { IpLocationModel } from '../models/db/ip_location.model';
import { app, getSettingValByKey, postgres_client } from '../helpers/core_function';
import { SETTINGS_SLUG } from '../helpers/slug_constants';

export class IpLocationService {
  async getOrCreateIpLocation(ip_address: string): Promise<IpLocationModel> {
    if (!ip_address) return null;
    try {
      const findIpAddress = await postgres_client.ipLocation.findUnique({
        where: {
          ip_address: ip_address,
        },
      });

      if (findIpAddress) return findIpAddress;

      const TOKEN =
        (await getSettingValByKey(SETTINGS_SLUG.IP_INFO_TOKEN)) ?? '';
      const API_URL = TOKEN
        ? `https://ipinfo.io/${ip_address}?token=${TOKEN}`
        : `https://ipinfo.io/${ip_address}/json`;

      const responseData = await lastValueFrom(
        app.get(HttpService).get(API_URL),
      );

      if (responseData.status != 200) {
        return null;
      }

      const data = responseData.data;

      return await postgres_client.ipLocation.create({
        data: {
          ip_address: data.ip,
          city: data.city ?? '',
          region: data.region ?? '',
          country_code: data.country ?? '',
          other_infos: JSON.stringify(data),
        },
      });
    } catch (error) {
      if (error.stack) console.error(error.stack);
      console.error(`ip_address: ${ip_address}`);
      return null;
    }
  }
}
