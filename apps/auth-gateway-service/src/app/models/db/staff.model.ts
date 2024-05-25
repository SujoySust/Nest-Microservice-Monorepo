import {
  Field,
  FieldMiddleware,
  HideField,
  Int,
  MiddlewareContext,
  ObjectType,
} from '@nestjs/graphql';
import { AuthenticatableInterface } from '../../../libs/auth/authenticatable.interface';
import { get_online_status } from '../../helpers/core_functions';
import { g2faEnableCheckMiddleware } from '../../middlewares/g2fa_enable_check.field.middleware';
import { Role } from './role.model';

const OnlineStatusMW: FieldMiddleware = async (ctx: MiddlewareContext) => {
  const staff = ctx.source;
  return get_online_status('staff', staff);
};

@ObjectType()
export class Staff implements AuthenticatableInterface {
  @Field(() => Int)
  id: number;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String)
  username: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  email_verified_at?: Date;

  is_email_verified: boolean;

  @Field(() => String, { nullable: true })
  resetcode?: string;

  @HideField()
  google2fa_secret?: string;

  @Field({ middleware: [g2faEnableCheckMiddleware] })
  google2fa_enabled?: boolean;

  @Field(() => Int, { nullable: true })
  role_id?: number;

  @Field(() => Int, { middleware: [OnlineStatusMW] })
  online_status?: number;

  @Field(() => Int)
  status: number;

  @Field(() => Role)
  role?: Role;

  @HideField()
  password: string;
}
