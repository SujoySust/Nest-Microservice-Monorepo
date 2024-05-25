import { Field, InputType } from '@nestjs/graphql';
import { SETTINGS_SLUG } from '../../../helpers/slug_constants';

@InputType()
export class apiSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG.TWILIO_ACCOUNT_SID]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.TWILIO_AUTH_TOKEN]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.TWILIO_PHONE_NUMBER]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.GOOGLE_ANALYTICS_MEASUREMENT_ID]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.SENTRY_DSN]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.IP_INFO_TOKEN]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.AWS_S3_BUCKET]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.AWS_S3_ACCESS_KEY]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.AWS_S3_KEY_SECRET]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.AWS_S3_REGION]: string;
}
