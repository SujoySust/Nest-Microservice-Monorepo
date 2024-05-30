import { Field, InputType } from '@nestjs/graphql';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { SETTINGS_SLUG } from '../../../../../../../libs/helpers/common/common.slugs';
@InputType()
export class logoSettingsInput {
  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG.APP_LOGO_LARGE]: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG.APP_LOGO_SMALL]: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG.FAVICON_LOGO]: FileUpload;
}
