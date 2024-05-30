import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { SETTINGS_SLUG } from '../../../../../../../libs/helpers/common/common.slugs';

@InputType()
export class metaSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG.META_TITLE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG.META_DESCRIPTION]: string;

  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG.META_IMAGE_URL]: FileUpload;

  @Field({ nullable: true })
  [SETTINGS_SLUG.META_TYPE]: string;
}
