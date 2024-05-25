import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseTimeModel {
  @Field({
    description: 'Identifies the date and time when the object was created.',
  })
  created_at?: Date;
  @Field({
    description:
      'Identifies the date and time when the object was last updated.',
  })
  updated_at?: Date;
}

@ObjectType({ isAbstract: true })
export abstract class BaseModelBigInt extends BaseTimeModel {
  @Field(() => BigInt)
  id: bigint;
}

@ObjectType({ isAbstract: true })
export abstract class HiddenIdBaseModelBigInt extends BaseTimeModel {
  @HideField()
  id: bigint;
}

@ObjectType({ isAbstract: true })
export abstract class BaseModel extends BaseTimeModel {
  @Field(() => Int)
  id: number;
}

@ObjectType({ isAbstract: true })
export abstract class HiddenIdBaseModelInt extends BaseTimeModel {
  @HideField()
  id: number;
}
