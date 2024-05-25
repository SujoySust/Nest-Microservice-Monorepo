import { Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';

import { GQL_SUBSCRIPTION, OnlineStatusSubRes } from './subscriptions';

// import { processWsContextAndGetUserOrStaff } from '../configs/graphql.config';
import { redis_pub_sub } from '../helpers/core_function';

@SkipThrottle()
export class CoreGqlSubscriptions {
  // private logger: MyLogger;
  // constructor() {
  //   this.logger = new MyLogger('gql_subscriptions.log');
  // }

  // @Subscription(() => UserNotificationSubsRes, {
  //   nullable: true,
  //   name: GQL_SUBSCRIPTION.USER_NOTIFICATION_EVENT,
  //   filter: (payload, variables) => {
  //     try {
  //       return (
  //         payload[GQL_SUBSCRIPTION.USER_NOTIFICATION_EVENT].usercode ==
  //         variables.usercode
  //       );
  //     } catch (e) {
  //       // new MyLogger('gql_subscriptions.log').write(e.stack, LOG_LEVEL_ERROR);
  //     }
  //   },
  // })
  // async handleUserNotificationEvent(
  //   @Args('usercode') usercode: string,
  //   @Context() context: any,
  // ) {
  //   try {
  //     if (!usercode) return;

  //     let user = context?.extra?.user;
  //     if (!user) user = context?.user;
  //     if (!user) {
  //       const data = await processWsContextAndGetUserOrStaff(context);
  //       user = data?.user;
  //     }

  //     if (!user || user.usercode != usercode) {
  //       return;
  //     }

  //     return redis_pub_sub.asyncIterator(
  //       GQL_SUBSCRIPTION.USER_NOTIFICATION_EVENT,
  //     );
  //   } catch (e) {
  //     // this.logger.write(e.stack, LOG_LEVEL_ERROR);
  //     return;
  //   }
  // }

  @Subscription(() => OnlineStatusSubRes, {
    nullable: true,
    name: GQL_SUBSCRIPTION.USER_ONLINE_STATUS,
  })
  handleUserOnlineStatus() {
    try {
      return redis_pub_sub.asyncIterator(GQL_SUBSCRIPTION.USER_ONLINE_STATUS);
    } catch (e) {
      // this.logger.write(e.stack, LOG_LEVEL_ERROR);
    }
  }

  @Subscription(() => OnlineStatusSubRes, {
    nullable: true,
    name: GQL_SUBSCRIPTION.STAFF_ONLINE_STATUS,
  })
  handleStaffOnlineStatus() {
    try {
      return redis_pub_sub.asyncIterator(GQL_SUBSCRIPTION.STAFF_ONLINE_STATUS);
    } catch (e) {
      // this.logger.write(e.stack, LOG_LEVEL_ERROR);
    }
  }

  // @Subscription(() => StaffNotificationSubsRes, {
  //   nullable: true,
  //   name: GQL_SUBSCRIPTION.STAFF_NOTIFICATION_EVENT,
  //   filter: (payload, variables) => {
  //     try {
  //       return (
  //         payload[GQL_SUBSCRIPTION.STAFF_NOTIFICATION_EVENT].username ==
  //         variables.username
  //       );
  //     } catch (e) {
  //       // new MyLogger('gql_subscriptions.log').write(e.stack, LOG_LEVEL_ERROR);
  //     }
  //   },
  // })
  // async handleStaffNotificationEvent(
  //   @Args('username') username: string,
  //   @Context() context: any,
  // ) {
  //   try {
  //     if (!username) return;

  //     let staff = context?.extra?.staff;
  //     if (!staff) staff = context?.staff;
  //     if (!staff) {
  //       const data = await processWsContextAndGetUserOrStaff(context);
  //       staff = data?.staff;
  //     }

  //     if (!staff || staff.username != username) {
  //       return;
  //     }

  //     return redis_pub_sub.asyncIterator(
  //       GQL_SUBSCRIPTION.STAFF_NOTIFICATION_EVENT,
  //     );
  //   } catch (e) {
  //     // this.logger.write(e.stack, LOG_LEVEL_ERROR);
  //     return;
  //   }
  // }
}
