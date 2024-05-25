import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
import { Prisma } from '../../../../../../libs/prisma/postgres/clients';

@Scalar('JsonValue', () => Object)
export class JsonValueScalar implements CustomScalar<string, Prisma.JsonValue> {
  description =
    'JsonValue custom scalar type. Basically JSON.stringify() string';

  parseValue(value: string): Prisma.JsonValue {
    return JSON.parse(value); // value from the client
  }

  serialize(value: Prisma.JsonValue): string {
    return JSON.stringify(value); // value sent to the client
  }

  parseLiteral(ast: any): Prisma.JsonValue {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    }
  }
}
