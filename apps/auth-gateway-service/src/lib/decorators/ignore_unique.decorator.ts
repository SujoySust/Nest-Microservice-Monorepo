import { PrismaClient } from '@prisma/client';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  __,
  lcfirst,
} from '../../../../../libs/helpers/common/common.functions';

function IgnoreUnique(
  data: {
    model: string;
    column: string;
    ignoreColumn: string;
  },
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [data.model, data.column, data.ignoreColumn],
      validator: ExistsConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IgnoreUnique' })
export class ExistsConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    let client: string = args.constraints[0];
    client = lcfirst(client);
    const column = args.constraints[1];
    const columnIgnore = args.constraints[2];
    const where = {};
    where[column] = value;
    const ignoredValue = args.object[columnIgnore];
    const prisma = new PrismaClient();
    try {
      const data = await prisma[client].findFirst({
        where: {
          NOT: {
            id: ignoredValue,
          },
          ...where,
        },
      });
      return data ? false : true;
    } catch (e) {
      console.error(
        `Can't find '${args.constraints[0]}' prisma model or column '${column}'.`,
      );
      throw e;
    }
  }

  defaultMessage?(args?: ValidationArguments): string {
    return `${args.property} ` + __('already exists.');
  }
}
