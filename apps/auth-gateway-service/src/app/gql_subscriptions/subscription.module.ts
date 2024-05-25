import { Module } from '@nestjs/common';
import { CoreGqlSubscriptions } from './core.gql_subcriptions';

@Module({
  providers: [CoreGqlSubscriptions],
})
export class SubscriptionModule {}
