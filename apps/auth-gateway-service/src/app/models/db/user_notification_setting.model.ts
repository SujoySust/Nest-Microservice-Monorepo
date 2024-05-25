import { HiddenIdBaseModelBigInt } from 'src/libs/model/base.model';
import { Field, HideField, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserNotificationSetting extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;

  @Field(() => String, { nullable: true })
  events: string;

  @Field(() => String, { nullable: true })
  event_names?: string;
}
