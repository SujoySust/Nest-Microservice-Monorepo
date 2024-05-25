import { Field, InputType } from '@nestjs/graphql';
import { SETTINGS_SLUG } from '../../../helpers/slug_constants';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
@InputType()
export class logoSettingsInput {
  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG.APP_LOGO_LARGE]: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG.APP_LOGO_SMALL]: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG.FAVICON_LOGO]: FileUpload;
}
