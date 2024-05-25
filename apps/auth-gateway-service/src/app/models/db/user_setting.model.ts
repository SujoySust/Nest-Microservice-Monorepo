import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../lib/model/base.model';
import { g2faEnableCheckMiddleware } from '../../middlewares/g2fa_enable_check.field.middleware';

@ObjectType()
export class UserSetting extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;

  @Field(() => Int, { nullable: true })
  email_verified?: number;

  @Field(() => Date, { nullable: true })
  last_email_verified_at?: Date;

  @Field(() => Int, { nullable: true })
  phone_verified?: number;

  @Field(() => Date, { nullable: true })
  last_phone_verified_at?: Date;

  @Field(() => Int, { nullable: true })
  login_twofa_enabled?: number;

  @HideField()
  google2fa_secret?: string;

  @Field({ middleware: [g2faEnableCheckMiddleware] })
  google2fa_enabled?: boolean;

  @Field(() => Date, { nullable: true })
  last_google2fa_updated_at?: Date;

  @Field(() => Int, { nullable: true })
  identity_verified?: number;

  @Field(() => Date, { nullable: true })
  last_identity_verified_at?: Date;

  @Field(() => String, { nullable: true })
  identity_verify_reject_reason?: string;

  @Field(() => Int, { nullable: true })
  address_verified?: number;

  @Field(() => String, { nullable: true })
  address_verify_reject_reason?: string;

  @Field(() => Int, { nullable: true })
  anti_phishing_code?: string;

  @Field(() => Date, { nullable: true })
  last_anti_phishing_updated_at?: Date;

  @Field(() => Int, { nullable: true })
  device_check_enabled?: number;

  @Field(() => Date, { nullable: true })
  last_login_time?: Date;

  @Field(() => Int, { nullable: true })
  email_marketing_enabled?: number;

  @Field(() => Int, { nullable: true })
  market_analytics_enabled?: number;

  @Field(() => Int, { nullable: true })
  advertising_enabled?: number;

  @Field(() => Int, { nullable: true })
  default_deposit_wallet_type?: number;
}
