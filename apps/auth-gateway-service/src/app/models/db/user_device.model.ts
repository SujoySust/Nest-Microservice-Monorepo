import { ObjectType, HideField, Field, Int } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../libs/model/base.model';
import { FieldMiddleware, MiddlewareContext } from '@nestjs/graphql';

const isLoggedInCheck: FieldMiddleware = async (ctx: MiddlewareContext) => {
  const source: UserDeviceModel = ctx.source;
  if (
    source.login_secret &&
    Number(source.login_secret_expires_at) > Number(new Date())
  )
    return true;
  else return false;
};

@ObjectType()
export class UserDeviceModel extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;

  @Field(() => String, { nullable: true })
  device_type: string;

  @Field(() => String)
  device_token: string;

  @Field(() => Date, { nullable: true })
  device_token_expires_at: Date;

  @HideField()
  login_secret: string;

  @Field({ middleware: [isLoggedInCheck] })
  is_logged_in: boolean;

  @HideField()
  login_secret_expires_at: Date;

  @Field(() => String, { nullable: true })
  device_info: string;

  @Field(() => String, { nullable: true })
  user_agent: string;

  @Field(() => String, { nullable: true })
  ip_address: string;

  @Field(() => String, { nullable: true })
  location: string;

  @Field(() => Int)
  status: number;
}
