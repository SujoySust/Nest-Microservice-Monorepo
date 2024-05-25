/* eslint-disable prettier/prettier */
import {
  Field,
  FieldMiddleware,
  HideField,
  Int,
  MiddlewareContext,
  ObjectType,
} from '@nestjs/graphql';
import { UserDeviceModel } from './user_device.model';
import { UserInfo } from './user_info.model';
import { UserNotificationSetting } from './user_notification_setting.model';
import { UserSetting } from './user_setting.model';
import { UserVerifyCodes } from './user_verify_codes.model';
import { AuthenticatableInterface } from '../../../lib/auth/authenticatable.interface';
import { FileUrlMiddleware } from '../../middlewares/url_related_field.middleware';
import { HiddenIdBaseModelBigInt } from '../../../lib/model/base.model';
import { get_online_status } from '../../helpers/core_function';

const OnlineStatusMW: FieldMiddleware = async (ctx: MiddlewareContext) => {
  const user = ctx.source;
  return get_online_status('user', user);
};

@ObjectType()
export class User
  extends HiddenIdBaseModelBigInt
  implements AuthenticatableInterface
{
  @HideField()
  static excludeAutoProcessSearchColumns = ['id', 'avatar', 'password'];

  @Field(() => String)
  usercode: string;

  @Field(() => String, { nullable: true })
  fullname?: string;

  @Field(() => String, { nullable: true })
  nickname?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @HideField()
  password: string | null;

  @Field(() => Int)
  status: number;

  @Field(() => Int, { middleware: [OnlineStatusMW] })
  online_status?: number;

  @Field({ middleware: [FileUrlMiddleware] })
  avatar?: string;

  @Field(() => Int)
  type: number;

  @Field(() => Int)
  reg_type: number;

  @Field(() => String, { nullable: true })
  social_id?: string;

  @Field(() => UserInfo, { nullable: true })
  info?: UserInfo;

  @Field(() => UserSetting, { nullable: true })
  setting?: UserSetting;

  @Field(() => [UserVerifyCodes], { nullable: true })
  verify_codes?: UserVerifyCodes[];

  @Field(() => User, { nullable: true })
  referral_parent?: User;
  // referral_childs?: User[];

  @Field(() => [UserDeviceModel], { nullable: true })
  devices?: UserDeviceModel[];

  @Field(() => UserNotificationSetting, { nullable: true })
  notification_settings?: UserNotificationSetting;
}
