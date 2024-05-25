import {
  Field,
  FieldMiddleware,
  HideField,
  Int,
  MiddlewareContext,
  NextFn,
  ObjectType,
} from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../libs/model/base.model';
import { NOTIFICATION_STATUS } from '../../helpers/notification/core_constants';

const StatusMW: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const notif: StaffNotificationModel = ctx.source;
  let status = await next();
  if (!notif.staff_id) {
    status = NOTIFICATION_STATUS.READ;
  }
  return status;
};

@ObjectType()
export class StaffNotificationBaseModel extends HiddenIdBaseModelBigInt {
  @Field(() => String)
  uid: string;

  @HideField()
  staff_id: number;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  module?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int, { middleware: [StatusMW] })
  status: number;
}

@ObjectType()
export class StaffNotificationModel extends StaffNotificationBaseModel {}
