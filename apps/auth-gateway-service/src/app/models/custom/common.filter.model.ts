import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CommonFilterArgs {
  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Int, { nullable: true })
  status?: number;
}
