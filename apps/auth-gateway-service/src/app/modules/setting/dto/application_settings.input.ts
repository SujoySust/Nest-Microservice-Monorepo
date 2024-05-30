import { Field, InputType } from '@nestjs/graphql';
import { SETTINGS_SLUG } from '../../../../../../../libs/helpers/common/common.slugs';

@InputType()
export class applicationSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG.VERIFY_CODE_RESEND_TIME_IN_SEC]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.VERIFY_CODE_EXPIRATION_TIME_IN_MIN]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.PHONE_2FA_OTP_IS_ENABLED]: string;
}
