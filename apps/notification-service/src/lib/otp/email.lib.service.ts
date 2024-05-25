import { BadRequestException, Injectable } from '@nestjs/common';

import { NotificationLibService } from '../notification/notification.lib.service';
import {
  ResponseModel,
  UserModel,
} from '../../../../../libs/helpers/rest/rest.types';
import {
  errorResponse,
  successResponse,
} from '../../../../../libs/helpers/rest/rest.functions';
import { __ } from '../../../../../libs/helpers/common/common.functions';
import { app } from '../../helpers/notification.functions';
import { EmailOtpVerificationNotification } from '../../modules/notification/external/email/user/email_otp_verification.notification';

@Injectable()
export class EmailLibService {
  async sendEmail(
    user: UserModel,
    code: string,
    message: string,
  ): Promise<ResponseModel> {
    if (!user || !user.email) {
      throw new BadRequestException(errorResponse(__('Invalid user email')));
    }

    const mailData = {
      email: user.email,
      verification_code: code,
      event_message: message,
    };

    const notification_service = app.get(NotificationLibService);

    notification_service.send(
      new EmailOtpVerificationNotification(mailData),
      user,
    );
    return successResponse(__('Email sent successfully'));
  }
}
