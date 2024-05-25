import { Field, InputType } from '@nestjs/graphql';
import { SETTINGS_SLUG } from '../../../helpers/slug_constants';

@InputType()
export class generalSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG.APPLICATION_TITLE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.CONTRACT_EMAIL]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.CONTRACT_PHONE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.ADDRESS]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.COPY_RIGHT]: string;
}
