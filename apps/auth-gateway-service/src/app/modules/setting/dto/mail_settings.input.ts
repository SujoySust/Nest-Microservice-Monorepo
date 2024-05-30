import { Field, InputType } from '@nestjs/graphql';
import { SETTINGS_SLUG } from '../../../../../../../libs/helpers/common/common.slugs';

@InputType()
export class mailSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_DIRIVER]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_HOST]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_PORT]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_USERNAME]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_PASSWORD]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_ENCRYPTION]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_FROM_ADDRESS]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.MAIL_FROM_NAME]: string;
}
