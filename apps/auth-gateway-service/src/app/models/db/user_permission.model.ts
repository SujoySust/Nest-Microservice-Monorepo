import { Field, Int, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../libs/model/base.model';

@ObjectType()
export class UserPermission extends HiddenIdBaseModelBigInt {
  @Field(() => Int, { nullable: true })
  deposit_status?: number;
  @Field(() => Int, { nullable: true })
  withdrawal_status?: number;
}
