import { registerAs } from '@nestjs/config';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

import { GraphqlConfig } from './config.interface';
import { CODE } from '../../../../libs/helpers/common/common.constant';
import { __ } from '../../../../libs/helpers/common/common.functions';

export const SOCKET_IDS: {
  [socket_id: string]: {
    user_type: 'user' | 'staff';
    id: number;
    user_identifier: string;
  };
} = {};
export const USER_SOCKET_IDS: { [user_id: number]: string[] } = {};
export const STAFF_SOCKET_IDS: { [staff_id: number]: string[] } = {};

export const GraphQLConfig = registerAs(
  'graphql',
  (): GraphqlConfig => ({
    playgroundEnabled: process.env.APP_DEBUG == 'true' ? true : false,
    debug: process.env.APP_DEBUG == 'true' ? true : false,
    introspection: process.env.APP_DEBUG == 'true' ? true : false,
    schemaDestination: './graphql/schema.gql',
    sortSchema: true,
    formatError: (error: GraphQLError): GraphQLFormattedError => {
      let message: string;
      let messages: string[];
      let code: number;
      try {
        message = error.extensions.originalError['message'];
        messages = error.extensions.originalError['messages'];
        code = error.extensions.originalError['statusCode'];
        return errorObj(message, messages, code);
      } catch (e) {
        if (
          error.extensions.code === 'GRAPHQL_VALIDATION_FAILED' ||
          error.extensions.code === 'BAD_USER_INPUT' ||
          error.extensions.code === 'GRAPHQL_PARSE_FAILED' ||
          error.message.search(/Must provide operation name/i) > -1
        ) {
          return errorObj(error.message, [], CODE.BAD_REQUEST);
        } else {
          // newConsole.log('gql err: ', error);
          let message = '';
          if (
            error.message.search(/File truncated/) >= 0 ||
            error.message.search(/needs to be used with/) >= 0
          ) {
            message = error.message;
            code = CODE.BAD_REQUEST;
          } else if (
            String(error.message)?.search(/Unknown argument.*? Did you mean/) >=
            0
          ) {
            //
            let msg = __('Invalid sort or orderBy column name');
            const parseCol = error.message.match(/Unknown argument \`.*?\`/);
            if (parseCol?.length) {
              const wrongColName = String(parseCol[0]).replace(
                'Unknown argument ',
                '',
              );
              msg += `: ${wrongColName}`;
            }
            return errorObj(msg, [], CODE.BAD_REQUEST);
            //
          } else if (error.message.includes('Throttler')) {
            return errorObj(error.message, [], CODE.BAD_REQUEST);
          }
          // newConsole.error(JSON.stringify(error));
          // console.log(
          //   `GQL Error Obj: ${JSON.stringify(error)}`,
          //   LOG_LEVEL_ERROR,
          // );
          console.error(`Core Error: ${e.stack}`);
          // return errorObj(message || errorResponse().message, null, code);
          return errorObj(message || '', null, code);
        }
      }
    },
    wsOnConnect: async (context: any): Promise<any> => {
      try {
        if (!context) {
          return { user: null, staff: null, connectionParams: {} };
        }
        // const data = await processWsContextAndGetUserOrStaff(context);
        // processUserStaffSocketID(context, 'connect', data);

        // if (context.extra) {
        //   context.extra.user = data?.user;
        //   context.extra.staff = data?.staff;
        // } else
        //   return {
        //     user: data?.user,
        //     staff: data?.staff,
        //     connectionParams: context,
        //   };
      } catch (e) {
        // console.log(e.stack, LOG_LEVEL_ERROR);
      }
    },
    wsOnDisconnect: async (
      ctx: any,
      code: number,
      reason: string,
    ): Promise<any> => {
      // newConsole.log('code: ', code);
      // newConsole.log('reason: ', reason);
      // processUserStaffSocketID(ctx, 'disconnect');
    },
  }),
);

export function errorObj(message, messages?, code?) {
  const errObj = <any>{
    message: message,
    messages: messages ?? [],
    code: code || CODE.INTERNAL_SERVER_ERROR,
  };
  return errObj;
}

// export async function processWsContextAndGetUserOrStaff(
//   context: any,
// ): Promise<{ user: User; staff: Staff }> {
//   if (!context) {
//     return null;
//   }

//   let extra: any;
//   if (context.extra) {
//     extra = context.extra;
//   }

//   const connectionParams = context?.connectionParams
//     ? context?.connectionParams
//     : context;

//   let token = '';
//   if (connectionParams?.Authorization) {
//     token = connectionParams.Authorization.replace('Bearer ', '');
//   }
//   if (!token && extra) {
//     const rawCookies = extra.request.headers.cookie;
//     const cookies = cookie.parse(rawCookies ?? '');
//     token = cookies?.token;
//     if (!token) {
//       const headers = extra.request.headers;
//       token = headers.Authorization?.replace('Bearer ', '');
//     } else {
//       try {
//         token = JSON.parse(token)?.accessToken || token;
//       } catch (e) {}
//     }
//   }

//   if (!token) return null;
//   return token;
//   // return await extractUserOrStaff(token);
// }

// export async function extractUserOrStaff(
//   accessToken: string,
// ): Promise<{ user: User; staff: Staff }> {
//   if (!accessToken) return null;

//   const jwtHelper = app.get(JwtHelper);
//   let identifierObj = null;
//   try {
//     identifierObj = jwtHelper.authIdentifierFromToken(accessToken);
//     if (!identifierObj) return null;
//   } catch (e) {
//     return null;
//   }

//   const jwtStrategy = app.get(JwtStrategy);
//   const authService = await jwtStrategy.getAuthServiceByProvider(
//     identifierObj.provider,
//   );

//   const data = await authService.getUserByIdentifier(
//     identifierObj.authIdentifier,
//     identifierObj.login_secret,
//   );

//   const user = identifierObj.provider == 'user' ? <User>data : null;
//   const staff = identifierObj.provider == 'staff' ? <Staff>data : null;

//   return { user, staff };
// }

// export async function processUserStaffSocketID(
//   ctx: any,
//   event: 'connect' | 'disconnect',
//   data?: { user: User; staff: Staff },
// ) {
//   const socketID = ctx?.extra?.request?.headers['sec-websocket-key'];
//   if (!socketID) return;

//   if (event == 'connect') {
//     if (!data || (!data.user && !data.staff)) return;
//     if (data?.user) {
//       //
//       SOCKET_IDS[socketID] = {
//         user_type: 'user',
//         id: Number(data.user.id),
//         user_identifier: data.user.usercode,
//       };
//       if (!USER_SOCKET_IDS[Number(data.user.id)]) {
//         USER_SOCKET_IDS[Number(data.user.id)] = [];
//       }
//       USER_SOCKET_IDS[Number(data.user.id)].push(socketID);
//       //

//       //
//       if (USER_SOCKET_IDS[Number(data.user.id)].length == 1) {
//         redis_pub_sub.publish(GQL_SUBSCRIPTION.USER_ONLINE_STATUS, {
//           [GQL_SUBSCRIPTION.USER_ONLINE_STATUS]: {
//             user_identifier: data.user.usercode,
//             // status: STATUS_ACTIVE,
//           },
//         });
//       }
//     } else if (data?.staff) {
//       //
//       SOCKET_IDS[socketID] = {
//         user_type: 'staff',
//         id: Number(data.staff.id),
//         user_identifier: data.staff.username,
//       };
//       if (!STAFF_SOCKET_IDS[Number(data.staff.id)]) {
//         STAFF_SOCKET_IDS[Number(data.staff.id)] = [];
//       }
//       STAFF_SOCKET_IDS[Number(data.staff.id)].push(socketID);
//       //

//       //
//       if (STAFF_SOCKET_IDS[Number(data.staff.id)].length == 1) {
//         redis_pub_sub.publish(GQL_SUBSCRIPTION.STAFF_ONLINE_STATUS, {
//           [GQL_SUBSCRIPTION.STAFF_ONLINE_STATUS]: {
//             user_identifier: data.staff.username,
//             // status: STATUS_ACTIVE,
//           },
//         });
//       }
//     }
//   } else if (event == 'disconnect') {
//     //
//     const socket_user_data = { ...SOCKET_IDS[socketID] };
//     if (!socket_user_data) return;
//     //
//     if (socket_user_data.user_type == 'user') {
//       const user_socket_ids = USER_SOCKET_IDS[Number(socket_user_data.id)];
//       const socket_id_idx = user_socket_ids.findIndex(
//         (scoket_id) => scoket_id == socketID,
//       );
//       user_socket_ids.splice(socket_id_idx, 1); //deleting the elem
//       delete SOCKET_IDS[socketID];
//       //

//       //
//       if (USER_SOCKET_IDS[Number(socket_user_data.id)].length == 0) {
//         redis_pub_sub.publish(GQL_SUBSCRIPTION.USER_ONLINE_STATUS, {
//           [GQL_SUBSCRIPTION.USER_ONLINE_STATUS]: {
//             user_identifier: socket_user_data.user_identifier,
//             // status: STATUS_INACTIVE,
//           },
//         });
//       }
//       //
//     } else if (socket_user_data.user_type == 'staff') {
//       const user_socket_ids = STAFF_SOCKET_IDS[Number(socket_user_data.id)];
//       const socket_id_idx = user_socket_ids.findIndex(
//         (scoket_id) => scoket_id == socketID,
//       );
//       user_socket_ids.splice(socket_id_idx, 1); //deleting the elem
//       delete SOCKET_IDS[socketID];
//       //

//       //
//       if (STAFF_SOCKET_IDS[Number(socket_user_data.id)].length == 0) {
//         redis_pub_sub.publish(GQL_SUBSCRIPTION.STAFF_ONLINE_STATUS, {
//           [GQL_SUBSCRIPTION.STAFF_ONLINE_STATUS]: {
//             user_identifier: socket_user_data.user_identifier,
//             // status: STATUS_INACTIVE,
//           },
//         });
//       }
//     }
//   }

//   // newConsole.log('event: ', event);
//   // newConsole.log('socket ID: ', socketID);
//   // newConsole.log('USER_SOCKET_IDS: ', USER_SOCKET_IDS);
//   // newConsole.log('STAFF_SOCKET_IDS: ', STAFF_SOCKET_IDS);
//   // newConsole.log('\n');
// }
