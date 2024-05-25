import { HideField, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelBigInt } from '../../../libs/model/base.model';

@ObjectType()
export class UserVerifyCodes extends HiddenIdBaseModelBigInt {
  @HideField()
  user_id: bigint;

  method: number;
  event: number;
  code: string;
  status: number;
  last_sent_at: Date;
  expires_at: Date;
}
