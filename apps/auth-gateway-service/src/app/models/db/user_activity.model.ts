import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';

import { User } from './user.model';
import { HiddenIdBaseModelBigInt } from '../../../lib/model/base.model';

@ObjectType()
export class UserActivityModel extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;

  @Field(() => String)
  ip_address: string;

  @Field(() => String)
  location: string;

  @Field(() => Int)
  event: number;

  @Field(() => Int)
  activity: number;

  @Field(() => Int)
  status: number;

  @Field(() => String, { nullable: true })
  device_type?: string;

  @Field(() => String, { nullable: true })
  device_info?: string;

  @Field(() => String, {
    nullable: true,
    // middleware: [TranslationMW],
  })
  description?: string;

  @Field(() => User)
  user?: User;
}

@ObjectType()
export class B_UserActivityModel extends UserActivityModel {}
