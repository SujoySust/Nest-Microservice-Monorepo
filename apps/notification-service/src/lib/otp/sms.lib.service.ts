import { BadRequestException, Injectable } from '@nestjs/common';
import { TwilioClient } from 'nestjs-twilio';
import * as Twilio from 'twilio';
import { ResponseModel } from '../../../../../libs/helpers/rest/rest.types';
import {
  SETTINGS_GROUP,
  SETTINGS_SLUG,
} from '../../../../../libs/helpers/common/common.slugs';
import {
  __,
  getSettingsGroup,
} from '../../../../../libs/helpers/common/common.functions';
import {
  errorResponse,
  successResponse,
} from '../../../../../libs/helpers/rest/rest.functions';

@Injectable()
export class SmsLibService {
  private apiSettings: any;
  private twilioClient: TwilioClient;

  async init() {
    this.apiSettings = await getSettingsGroup([SETTINGS_GROUP.API]);
    this.twilioClient = Twilio(
      this.apiSettings[SETTINGS_SLUG.TWILIO_ACCOUNT_SID],
      this.apiSettings[SETTINGS_SLUG.TWILIO_AUTH_TOKEN],
    );
  }

  async sendSms(phone: string, message: string): Promise<ResponseModel> {
    if (!phone) {
      throw new BadRequestException(errorResponse(__('Phone is required!')));
    }
    this.sendSmsByTwilio(phone, message);
    return successResponse(__('Sms sent successfully.'));
  }

  async sendSmsByTwilio(phone: string, message: string) {
    try {
      await this.init();
      const send = await this.twilioClient.messages.create({
        body: message,
        from: this.apiSettings[SETTINGS_SLUG.TWILIO_PHONE_NUMBER] ?? '',
        to: phone,
      });
      return send;
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  }

  async validatePhone(phone: string): Promise<string> {
    try {
      if (!phone) {
        throw new BadRequestException(
          errorResponse(__('Phone number is required.')),
        );
      }
      await this.init();
      const phoneData = await this.twilioClient.lookups.v1
        .phoneNumbers(phone)
        .fetch();
      return phoneData.phoneNumber;
    } catch (error) {
      if (error.status == 404) {
        throw new BadRequestException(
          errorResponse(__('Invalid phone number!')),
        );
      }
      console.error(JSON.stringify(error));
      throw new Error(errorResponse().message);
    }
  }
}
