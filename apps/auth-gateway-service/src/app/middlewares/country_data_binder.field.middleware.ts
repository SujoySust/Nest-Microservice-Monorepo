import { FieldMiddleware, MiddlewareContext } from '@nestjs/graphql';

import { CountryData, IpLocationModel } from '../models/db/ip_location.model';
import { getCountry } from '../helpers/core_function';
import {
  Country_Data,
  Currencies,
} from '../../../../../libs/helpers/common/country_data.helper';

export const CountryDataBinderMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
): Promise<CountryData> => {
  const ipModel: IpLocationModel = ctx.source;
  const countryDetailsData = Country_Data[ipModel.country_code];
  const currSymbol =
    Currencies[countryDetailsData?.currencyCode]?.symbol ??
    (countryDetailsData?.currencyCode || '');
  return {
    name: countryDetailsData?.name,
    language: countryDetailsData?.lang[0],
    currency: countryDetailsData?.currencyCode,
    currency_symbol: currSymbol,
    phone_code: countryDetailsData?.phone_code,
  };
};

export const CountryNameMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
) => {
  const ipModel: IpLocationModel = ctx.source;
  const countryCode = ipModel.country_code;
  return countryCode ? getCountry(countryCode) : countryCode;
};
