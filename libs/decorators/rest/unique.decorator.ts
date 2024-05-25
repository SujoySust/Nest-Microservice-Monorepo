import { PrismaClient } from '@prisma/client';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { __, lcfirst } from '../../helpers/common/common.functions';

export function Unique(
  prismaModel: string,
  validationOptions?: ValidationOptions,
  extraWhereCond?: any,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [prismaModel, extraWhereCond],
      validator: UniqueConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Unique' })
export class UniqueConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    let client: string = args.constraints[0];
    client = lcfirst(client);

    let extraWhereCond = args.constraints[1];
    extraWhereCond = extraWhereCond || {};

    const column = args.property;
    let where = {};
    where[column] = value;
    where = {
      ...where,
      ...extraWhereCond,
    };
    const prisma = new PrismaClient();
    try {
      if (!value) return true;
      const data = await prisma[client].findFirst({
        where: where,
      });
      return data ? false : true;
    } catch (e) {
      console.log(
        `Can't find '${args.constraints[0]}' prisma model or column '${column}'.`,
        // LOG_LEVEL.ERROR,
      );
      throw e;
    }
  }

  defaultMessage?(args?: ValidationArguments): string {
    return `${args.property} ` + __('already exists.');
  }
}
