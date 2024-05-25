import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { LOPaginatedData, ResponseModel } from '../../helpers/rest/rest.types';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(ResponseModel, LOPaginatedData, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseModel) },
          {
            properties: {
              data: {
                type: 'object',
                $ref: getSchemaPath(LOPaginatedData),
                properties: {
                  list: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiResponseModelWithData = <TModel extends Type<any>>(
  data_model: TModel,
  type: 'array' | 'object',
) => {
  return applyDecorators(
    ApiExtraModels(ResponseModel, data_model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseModel) },
          {
            properties: {
              data: {
                type: type,
                items:
                  type == 'array'
                    ? { $ref: getSchemaPath(data_model) }
                    : undefined,
                $ref: type == 'object' ? getSchemaPath(data_model) : undefined,
              },
            },
          },
        ],
      },
    }),
  );
};
