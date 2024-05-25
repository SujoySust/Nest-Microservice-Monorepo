import { PrismaClient } from '@prisma/client';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { __, lcfirst } from '../../helpers/common/common.functions';
import { CORE_PREFIX_SUFFIX } from '../../helpers/common/common.constant';

export function ExistsUniqueCheck(
  prisma_model: string,
  ignore_check_column: string,
  validationOptions?: ValidationOptions,
  extra_where_cond = {},
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [prisma_model, ignore_check_column, extra_where_cond],
      validator: ExistsConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'ExistsUniqueCheck', async: true })
export class ExistsConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    //
    let client: string = args.constraints[0];
    client = lcfirst(client);

    const ignore_check_column = args.constraints[1];

    let extra_where_cond = args.constraints[2];
    extra_where_cond = extra_where_cond || {};

    const ignore_value = args.object[ignore_check_column];
    if (!ignore_value) {
      throw new Error(
        `${CORE_PREFIX_SUFFIX.CUSTOM_VALIDATION_ERROR} (${ignore_check_column}) value not found in body data. This is issue is related with backend 'ExistsUniqueCheck' validator!!`,
      );
    }

    const where = {};
    const column = args.property;
    where[column] = value;
    const prisma = new PrismaClient();
    try {
      const data = await prisma[client].findFirst({
        where: {
          NOT: {
            [ignore_check_column]: ignore_value,
          },
          ...where,
          ...extra_where_cond,
        },
      });
      return data ? false : true;
    } catch (e) {
      console.log(
        `IgnoreUnique decorator failed for '${args.constraints[0]}' prisma model and column '${column}'.`,
        // LOG_LEVEL.ERROR,
      );
      throw e;
    }
  }

  defaultMessage?(args?: ValidationArguments): string {
    return `${args.property} ` + __('already exists.');
  }
}
