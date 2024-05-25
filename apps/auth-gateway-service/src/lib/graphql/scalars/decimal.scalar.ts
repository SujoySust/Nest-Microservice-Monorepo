import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime/library';

import { Kind } from 'graphql';
import { noExponents } from '../../../app/helpers/core_function';


@Scalar('Decimal', () => Decimal)
export class DecimalScalar implements CustomScalar<string, number> {
  description = 'Decimal custom scalar type. Basically string or number';

  parseValue(value: string): number {
    return Number(value); // value from the client
  }

  serialize(value: Decimal): string {
    let data = String(value);
    // value = new Decimal(multiplyNumbers(Number(value), 1));
    let prefixPositiveSign = false;
    if (data[0] == '+') {
      prefixPositiveSign = true;
      data = data.replace('+', '');
    }

    let result = noExponents(value); // value sent to the client
    if (prefixPositiveSign) result = `+${result}`;
    return result;
  }

  parseLiteral(ast: any): number {
    if (ast.kind === Kind.FLOAT || Kind.STRING) {
      return Number(ast.value);
    }
    return null;
  }
}
