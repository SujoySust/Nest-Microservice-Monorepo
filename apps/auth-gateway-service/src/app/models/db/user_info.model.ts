import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../libs/model/base.model';
@ObjectType()
export class UserInfo extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;
  @Field()
  country?: string;
  city?: string;
  street1?: string;
  street2?: string;
  state?: string;
  zip?: string;
  gender?: number;
  dob?: Date;
  language?: string;
}
