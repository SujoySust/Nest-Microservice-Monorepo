import { HttpStatus } from '@nestjs/common';

function __(str: string) {
  return str;
}

//
export enum APP_ENV {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  LOCAL = 'local',
}

export enum COMMON_STATUS {
  STATUS_INACTIVE = 0,
  STATUS_ACTIVE = 1,
  STATUS_COMPLETED = 2,
  STATUS_PROCESSING = 3,
  STATUS_SKIPPED = 4,
  STATUS_FAILED = 5,
  STATUS_REJECTED = 6,
  STATUS_EXPIRED = 7,
  STATUS_DISABLED = 9,
  STATUS_SUSPENDED = 10,
  STATUS_DELETED = 11,
  STATUS_BLOCKED = 12,
}

export enum CODE {
  //200
  STATUS_OK = HttpStatus.OK,

  //400
  BAD_REQUEST = HttpStatus.BAD_REQUEST,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  PAYLOAD_TOO_LARGE = 413,

  //500
  INTERNAL_SERVER_ERROR = 500,

  //custom
  VERIFY_EMAIL = 901,
  VERIFY_PHONE = 902,
  VERIFY_DEVICE = 903,
  VERIFY_LOGIN_TWOFA = 904,
  USER_SUSPENDED = 905,
  ACCOUNT_NOT_ACTIVE = 906,
  USER_DISABLED = 907,
  COUNTRY_RESTRICTED = 1001,
}

export enum USER_STATUS {
  INACTIVE = 0,
  ACTIVE = 1,
  SUSPENDED = 2,
  DISABLED = 3,
}

export enum USER_TYPE {
  USER = 'user',
  STAFF = 'staff',
}

export const DEFAULT_MAX_DATA_SIZE_IN_BYTE = 10000000; // 10 mb

export enum DB_QUERY_DEFAULT {
  ORDER_FIELD = 'updated_at',
  ORDER_DIRECTION = 'desc',
  LIMIT = 10,
  OFFSET = 0,
}

export enum APP_DEFAULT {
  LANG = 'en',
  CURRENCY_CODE = 'USD',
  CURRENCY_SYMBOL = '$',
  COUNTRY_CODE = 'US',
}

export enum LOG_FILES {
  EVENTS = 'events.log',
}

export enum CORE_PREFIX_SUFFIX {
  CUSTOM_VALIDATION_ERROR = 'CTM:VLD',
}

export enum SERIVCE_URL {
  NOTIFICATION_SERVICE = 'http://localhost:3001',
}
