import { Field, InputType, Int } from '@nestjs/graphql';
import { ORDER_DIRECTION } from '../../../lib/graphql/order/order_direction';
import { DB_QUERY_DEFAULT } from '../../../../../../libs/helpers/common/common.constant';

@InputType()
export class OrderBy {
  @Field(() => String)
  field: string | DB_QUERY_DEFAULT;
  @Field(() => String)
  direction: string | DB_QUERY_DEFAULT | ORDER_DIRECTION;
}

@InputType()
export class GeeCaptchaInput {
  @Field(() => String)
  captcha_id: string;
  @Field(() => String)
  lot_number: string;
  @Field(() => String)
  captcha_output: string;
  @Field(() => String)
  pass_token: string;
  @Field(() => String)
  gen_time: string;
}

@InputType()
export class CodeVerifyInputs {
  @Field()
  code: string;
  @Field()
  method: number;
  @Field()
  event: number;
}

@InputType()
export class DateFilter {
  @Field(() => Date)
  start_date: Date;
  @Field(() => Date)
  end_date: Date;
}

export class DateFilterForRawQuery {
  start_date: string;
  end_date: string;
}

@InputType()
export class TimeFilter {
  @Field(() => Int, { nullable: true })
  days?: number;
  @Field(() => DateFilter, { nullable: true })
  date?: DateFilter;
}

@InputType()
export class BlockRangeInputDto {
  @Field(() => String)
  start_block: string;

  @Field(() => String)
  end_block: string;
}
