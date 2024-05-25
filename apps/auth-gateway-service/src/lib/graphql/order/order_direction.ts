import { registerEnumType } from '@nestjs/graphql';

export enum ORDER_DIRECTION {
  // Specifies an ascending order for a given `orderBy` argument.
  ASC = 'asc',
  // Specifies a descending order for a given `orderBy` argument.
  DESC = 'desc',
}

registerEnumType(ORDER_DIRECTION, {
  name: 'ORDER_DIRECTION',
  description:
    'Possible directions in which to order a list of items when provided an `orderBy` argument.',
});
