import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field(() => String, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean, { defaultValue: false })
  hasNextPage: boolean;

  @Field(() => Boolean, { defaultValue: false })
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor?: string;
}

export const PageInfoDefault = {
  endCursor: '',
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: '',
};
