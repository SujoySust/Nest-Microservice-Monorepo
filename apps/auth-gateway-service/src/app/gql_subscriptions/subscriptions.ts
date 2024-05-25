import { Field, Int, ObjectType } from '@nestjs/graphql';

export enum GQL_SUBSCRIPTION {
  USER_NOTIFICATION_EVENT = 's_user_userNotificationEvent',
  // USER_TOASTER_MESSAGE = 's_user_userToasterMessage',
  SYSTEM_NOTICE_EVENT = 's_core_systemNoticeForUser',
  SYSTEM_MESSAGE_EVENT = 's_core_systemMessageForUser',
  USER_ONLINE_STATUS = 's_core_userOnlineStatus',
  STAFF_ONLINE_STATUS = 's_core_staffOnlineStatus',
  STAFF_NOTIFICATION_EVENT = 's_staff_staffNotificationEvent',
}

@ObjectType()
export class UserNotificationSubsRes {
  @Field(() => String)
  usercode: string;

  @Field(() => Int, { nullable: true })
  action?: number;
}

@ObjectType()
export class StaffNotificationSubsRes {
  @Field(() => String)
  username: string;

  @Field(() => Int, { nullable: true })
  action?: number;
}

@ObjectType()
export class OnlineStatusSubRes {
  @Field(() => String)
  user_identifier: string;

  @Field(() => Int)
  status: number;
}
