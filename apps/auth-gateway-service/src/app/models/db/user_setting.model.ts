import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../libs/model/base.model';
import { g2faEnableCheckMiddleware } from '../../middlewares/g2fa_enable_check.field.middleware';

@ObjectType()
export class UserSetting extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;
  @Field()
  email_verified?: number;
  last_email_verified_at?: Date;
  phone_verified?: number;
  last_phone_verified_at?: Date;
  login_twofa_enabled?: number;
  @HideField()
  google2fa_secret?: string;
  @Field({ middleware: [g2faEnableCheckMiddleware] })
  google2fa_enabled?: boolean;
  last_google2fa_updated_at?: Date;
  identity_verified?: number;
  last_identity_verified_at?: Date;
  identity_verify_reject_reason?: string;
  address_verified?: number;
  address_verify_reject_reason?: string;
  anti_phishing_code?: string;
  last_anti_phishing_updated_at?: Date;
  device_check_enabled?: number;
  last_login_time?: Date;
  email_marketing_enabled?: number;
  market_analytics_enabled?: number;
  advertising_enabled?: number;
  default_deposit_wallet_type?: number;
}
