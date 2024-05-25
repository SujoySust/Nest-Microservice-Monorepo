import { PostgresService } from '../../../../libs/prisma/src';

export function TestProviderDependecy() {
  return [PostgresService];
}
