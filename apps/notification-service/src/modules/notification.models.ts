import { UserNotification } from '../../../../libs/prisma/postgres/clients';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HideField } from './decorators/field_related.decorator';

export class UserNotificationModel implements UserNotification {
  constructor(user_notification: Partial<UserNotification>) {
    for (const key in user_notification) {
      this[key] = user_notification[key];
    }
  }

  @HideField
  id: bigint;

  @HideField
  notice_id: bigint;

  @HideField
  user_id: bigint;

  @ApiPropertyOptional()
  uid: string;

  @ApiPropertyOptional()
  event: string;

  @ApiPropertyOptional()
  title: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional()
  status: number;

  @ApiPropertyOptional()
  created_at: Date;

  @ApiPropertyOptional()
  updated_at: Date;
}
