import { Field, Int, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../libs/model/base.model';

@ObjectType()
export class UserNotificationBaseModel extends HiddenIdBaseModelBigInt {
  @Field(() => String)
  uid: string;

  @Field(() => String)
  event: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  status: number;
}

@ObjectType()
class NoticeUserStatus {
  @Field()
  status: number;
}

@ObjectType()
class NoticeStatus {
  @Field(() => [NoticeUserStatus])
  users_status: NoticeUserStatus[];
}

@ObjectType()
export class F_UserNotificationModel extends UserNotificationBaseModel {
  @Field(() => NoticeStatus, { nullable: true })
  notice?: NoticeStatus;
}
