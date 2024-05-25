import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  skip?: number;

  @Field({ description: 'use end cursor value while using first' })
  after?: string;

  @Field({ description: 'use start cursor value while using last' })
  before?: string;

  first?: number;

  last?: number;
}

@ArgsType()
export class PaginationLimitOffsetArgs {
  offset?: number;
  limit?: number;
}

@ArgsType()
export class SearchArgs {
  @Field(() => [String], { description: 'columns for search' })
  columns?: string[];

  @Field({ description: 'value for search in given columns' })
  value?: string;
}
