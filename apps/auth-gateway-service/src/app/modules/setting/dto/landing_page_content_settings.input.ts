import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class LandingPageContentSettingsInput {
  @Field(() => String)
  section_slug: string;

  @Field(() => [String])
  title: string[];

  @Field(() => [String], { nullable: true })
  subtitle?: string[];

  @Field(() => [GraphQLUpload], { nullable: true })
  image?: FileUpload[];

  @Field(() => [String], { nullable: true })
  short_description?: string[];

  @Field(() => [String], { nullable: true })
  long_description?: string[];

  @Field(() => [String], { nullable: true })
  link?: string[];
}

@InputType()
export class LandingPageSliderSettingsInput {
  @Field(() => String)
  section_slug: string;

  @Field(() => [GraphQLUpload])
  image: FileUpload[];

  @Field(() => [String], { nullable: true })
  link?: string[];
}
