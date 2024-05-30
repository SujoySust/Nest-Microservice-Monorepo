import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { MessageInterface } from './messages/message.interface';
import { transports } from './transports';
import { TransportInterface } from './transports/transport.interface';
import {
  getSettingsGroup,
  appName,
} from '../../../../../libs/helpers/common/common.functions';
import {
  SETTINGS_GROUP,
  SETTINGS_SLUG,
} from '../../../../../libs/helpers/common/common.slugs';
import { MailConfig } from '../../config/config.interface';
import { postgres_client } from '../../../../auth-gateway-service/src/app/helpers/core_function';

@Injectable()
export class MailService {
  private mailConfig: MailConfig;
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService,
  ) {
    this.mailConfig = this.configService.get<MailConfig>('mail');
  }
  async send(
    message: MessageInterface,
    from?: { address?: string; name?: string },
  ) {
    const mailSettings = await getSettingsGroup(postgres_client, [
      SETTINGS_GROUP.EMAIL,
    ]);
    const defaultMailer =
      mailSettings[SETTINGS_SLUG.MAIL_DIRIVER] || this.mailConfig.defaultMailer;
    const mailConfig = {
      host:
        mailSettings[SETTINGS_SLUG.MAIL_HOST] ||
        this.mailConfig.mailers[defaultMailer].host,
      port: Number(
        mailSettings[SETTINGS_SLUG.MAIL_PORT] ||
          this.mailConfig.mailers[defaultMailer].port,
      ),
      username:
        mailSettings[SETTINGS_SLUG.MAIL_USERNAME] ||
        this.mailConfig.mailers[defaultMailer].username,
      password:
        mailSettings[SETTINGS_SLUG.MAIL_PASSWORD] ||
        this.mailConfig.mailers[defaultMailer].password,
      encryption:
        mailSettings[SETTINGS_SLUG.MAIL_ENCRYPTION] ||
        this.mailConfig.mailers[defaultMailer].encryption,
    };
    const transport: TransportInterface = await this.resolveTransport(
      defaultMailer,
    );
    const data = message.options ?? (await message.toTransporter());
    const mail_from_address = mailSettings[SETTINGS_SLUG.MAIL_FROM_ADDRESS];
    const mail_from_name = mailSettings[SETTINGS_SLUG.MAIL_FROM_NAME];
    const app_title = await appName();

    if (!data.from) {
      data.from = {
        address:
          from?.address || mail_from_address || this.mailConfig.from.address,
        name:
          from?.name ||
          mail_from_name ||
          app_title ||
          this.mailConfig.from.name,
      };
    }
    return await transport.send(data, mailConfig);
  }

  resolveTransport(defaultMailer) {
    return this.moduleRef.create(transports[defaultMailer]);
  }
}
