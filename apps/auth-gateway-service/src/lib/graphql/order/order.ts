import { Field, InputType } from '@nestjs/graphql';
import { ORDER_DIRECTION } from './order_direction';

@InputType({ isAbstract: true })
export abstract class Order {
  @Field(() => ORDER_DIRECTION)
  direction: ORDER_DIRECTION;
}
