import { Options as MailOptions } from 'nodemailer/lib/mailer';
import { SmtpConfig } from '../../../config/config.interface';

export interface TransportInterface {
  send(message: MailOptions, config: SmtpConfig);
}
