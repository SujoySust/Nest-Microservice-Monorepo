import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DB_QUERY_DEFAULT } from '../../../../../../libs/helpers/common/common.constant';

export default function PaginatedLimitOffset<TItem>(
  TItemClass: Type<TItem>,
): any {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [TItemClass])
    nodes: Array<TItem>;

    @Field(() => Int, { nullable: true })
    totalCount: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    offset: number;
  }
  return PaginatedType;
}

export async function findManyOffsetLimitConnection<TItem>(
  limit: number,
  offset: number,
  itemFn: () => Promise<TItem[]>,
  countFn?: () => Promise<number>,
): Promise<{
  limit: number;
  offset: number;
  nodes: TItem[];
  totalCount?: number;
}> {
  return {
    nodes: (await itemFn()) || [],
    limit: limit ?? DB_QUERY_DEFAULT.LIMIT,
    offset: offset ?? DB_QUERY_DEFAULT.OFFSET,
    totalCount: countFn ? await countFn() : null,
  };
}
