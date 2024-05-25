import { Field, InputType } from '@nestjs/graphql';
import { SETTINGS_SLUG } from '../../../helpers/slug_constants';

@InputType()
export class socialSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG.FACEBOOK_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.TWITTER_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.INSTAGRAM_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.DISCORD_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.WHATSAPP_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.LINKEDIN_LINK]: string;
}
