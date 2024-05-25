import { Field, ObjectType } from '@nestjs/graphql';
import { CountryDataBinderMiddleware } from '../../middlewares/country_data_binder.field.middleware';

@ObjectType()
export class CountryData {
  name?: string;
  language?: string;
  currency?: string;
  currency_symbol?: string;
  phone_code?: string;
}

@ObjectType()
export class IpLocationModel {
  ip_address: string;
  city?: string;
  region?: string;
  country_code?: string;
  @Field({ middleware: [CountryDataBinderMiddleware] })
  country_data?: CountryData;
}
