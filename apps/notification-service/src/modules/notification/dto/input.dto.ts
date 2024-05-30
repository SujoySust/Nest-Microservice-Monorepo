import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import {
  EXTERNAL_NOTIFICATION_METHOD,
  NOTIFICATION_EVENTS,
  NOTIFICATION_TYPE,
} from '../../../helpers/notification.constants';
import { NotificationEventData } from './response.dto';
import { USER_TYPE } from '../../../../../../libs/helpers/common/common.constant';
import { __ } from '../../../../../../libs/helpers/common/common.functions';

export class SendNotificationDto {
  @ApiProperty({ description: __('Type of user: user, staff') })
  @IsIn(Object.values(USER_TYPE))
  user_type: USER_TYPE;

  @ApiProperty({
    description: __('Type of notification: external, internal, both'),
  })
  @IsIn(Object.values(NOTIFICATION_TYPE))
  notification_type: NOTIFICATION_TYPE;

  @ApiProperty({
    description: __(
      'Event of notifications: E.g: Code verification, Reset password',
    ),
  })
  @IsIn(Object.values(NOTIFICATION_EVENTS))
  event: NOTIFICATION_EVENTS;

  @ApiProperty({
    description: __('Method of notification: email, sms, both'),
  })
  @IsIn(Object.values(EXTERNAL_NOTIFICATION_METHOD))
  @IsOptional()
  method?: EXTERNAL_NOTIFICATION_METHOD;
}

export class ExternalNotificationPayload {
  method: EXTERNAL_NOTIFICATION_METHOD;
  user_type: USER_TYPE;
  event: NOTIFICATION_EVENTS;
  notify_data: NotificationEventData;
}

export class InternalNotificationPayload {
  user_type: USER_TYPE;
  notify_data: NotificationEventData;
}
