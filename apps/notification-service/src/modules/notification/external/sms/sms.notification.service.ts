import { Injectable } from '@nestjs/common';

import { NotificationInterface } from '../../notification.interface';

import { __ } from '@squareboat/nestjs-localization';
import {
  EXTERNAL_NOTIFICATION_METHOD,
  NOTIFICATION_TYPE,
} from '../../../../helpers/notification.constants';
import { app } from '../../../../helpers/notification.functions';
import { ExternalNotificationPayload } from '../../dto/input.dto';
import {
  ResponseModel,
  UserModel,
} from '../../../../../../../libs/helpers/rest/rest.types';
import { SmsLibService } from '../../../../lib/otp/sms.lib.service';
import { successResponse } from '../../../../../../../libs/helpers/rest/rest.functions';

@Injectable()
export class SmsNotificationService
  implements NotificationInterface<ExternalNotificationPayload>
{
  async send(
    user: UserModel,
    data: ExternalNotificationPayload,
  ): Promise<ResponseModel> {
    const { notify_data } = data;
    const _sms_data =
      notify_data[NOTIFICATION_TYPE.EXTERNAL][EXTERNAL_NOTIFICATION_METHOD.SMS];
    const otp_lib_service = app.get(SmsLibService);
    await otp_lib_service.sendSmsByTwilio(user.phone, _sms_data.description);
    return successResponse(__('Sms sent successfully!'));
  }
}
