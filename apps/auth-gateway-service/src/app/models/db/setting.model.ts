import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';
import { TranslationMW } from '../../middlewares/translation.field.middleware';

@ObjectType()
export class Setting {
  @HideField()
  id: number;

  @Field(() => Int, { nullable: true })
  value_type: number;

  @Field(() => String, { nullable: true })
  option_group: string;

  @Field(() => String)
  option_key: string;

  @Field(() => String, {
    nullable: true,
    middleware: [TranslationMW],
  })
  option_value: string;
}
