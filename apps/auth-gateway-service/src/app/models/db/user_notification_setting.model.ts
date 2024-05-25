import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../lib/model/base.model';

@ObjectType()
export class UserNotificationSetting extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;

  @Field(() => String, { nullable: true })
  events: string;

  @Field(() => String, { nullable: true })
  event_names?: string;
}
