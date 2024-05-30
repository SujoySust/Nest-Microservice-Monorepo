import { PostgresService } from '../../../../libs/prisma/src/postgres.service';

export function TestProviderDependecy() {
  return [PostgresService];
}
