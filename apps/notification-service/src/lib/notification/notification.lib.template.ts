import { createWriteStream, readFileSync } from 'fs';
import { compile } from 'handlebars';
import { resolve } from 'path';

import { MailMessage } from '../mail/messages/mail.message';
import { MessageInterface } from '../mail/messages/message.interface';
import {
  base_url,
  frontend_app_url,
  postgres_client,
} from '../../../../../libs/helpers/common/common.functions';
import {
  SETTINGS_GROUP,
  SETTINGS_SLUG,
} from '../../../../../libs/helpers/common/common.slugs';

export class NotificationTemplate {
  static async toEmail(
    template: string,
    variables: any,
    fromUserOrStaff: 'user' | 'staff' = 'user',
  ): Promise<MessageInterface> {
    try {
      variables['userOrStaff'] = fromUserOrStaff;
      variables = await NotificationTemplate.getOtherVariables(variables);
      const { subject, content } = NotificationTemplate.resolve(
        'email',
        template,
        variables,
      );
      return new MailMessage(content).subject(subject);
    } catch (e) {
      console.error(e.stack);
    }
  }

  static async getOtherVariables(variables: any) {
    const settings = await postgres_client.setting.findMany({
      where: {
        OR: [
          {
            option_group: {
              in: [SETTINGS_GROUP.SOCIAL, SETTINGS_GROUP.GENERAL],
            },
          },
          {
            option_key: {
              in: [SETTINGS_SLUG.APP_LOGO_LARGE],
            },
          },
        ],
      },
    });
    let settingObj = {};
    if (settings.length > 0) {
      settingObj = settings.reduce(
        (acc, cur) => ({ ...acc, [cur.option_key]: cur.option_value }),
        {},
      );
    }
    variables.settings = settingObj;
    if (variables.settings.app_logo_large) {
      // TODO: will change it
      // const fileService = app.get(FilesystemService);
      // variables.settings.app_logo_large = fileService.url(
      //   variables.settings.app_logo_large,
      // );
    }

    variables.frontend_app_url = frontend_app_url();
    variables.app_url = base_url();
    variables.header_layout = compile(
      readFileSync(
        resolve(
          `src/app/modules/notification/external/email/templates/${variables.userOrStaff}/layouts/header.html`,
        ),
      ).toString(),
    )({
      settings: settingObj,
      frontend_app_url: variables.frontend_app_url,
    });

    variables.footer_layout = compile(
      readFileSync(
        resolve(
          `src/app/modules/notification/external/email/templates/${variables.userOrStaff}/layouts/footer.html`,
        ),
      ).toString(),
    )({
      settings: settingObj,
      app_url: variables.app_url,
      frontend_app_url: variables.frontend_app_url,
      anti_phising_code: variables.anti_phishing_code,
    });

    return variables;
  }

  static update(channel: string, template: string, payload: any) {
    createWriteStream(
      resolve(
        `src/app/modules/notification/external/email/templates/${channel}/${template}.json`,
      ),
    ).write(JSON.stringify(payload));
  }

  static get(channel: string, template: string) {
    try {
      const templatePayload = readFileSync(
        resolve(
          `src/app/modules/notification/external/email/templates/${channel}/${template}.json`,
        ),
      ).toString();
      return JSON.parse(templatePayload) ?? null;
    } catch (e) {
      console.error(e.stack);
      return null;
    }
  }

  static resolve(channel: string, template: string, variables: any) {
    const subject = variables.subject;
    let content = '';
    /* content += readFileSync(
      resolve(`src/app/notifications/${variables.userOrStaff}/templates/email/layouts/header.html`),
    ).toString(); */
    content += readFileSync(
      `src/app/modules/notification/external/email/templates/${variables.userOrStaff}/${template}`,
    ).toString();
    /* content += readFileSync(
      resolve(`src/app/notifications/${variables.userOrStaff}/templates/email/layouts/footer.html`),
    ).toString(); */
    content = compile(content)(variables);
    content = NotificationTemplate.processDynamicHtml(content);
    return { subject, content };
  }

  static processDynamicHtml(content: string): string {
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&#x3D;/g, '=');
    content = content.replace(/&#x27;/g, "'");
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&amp;/g, '&');
    return content;
  }
}
