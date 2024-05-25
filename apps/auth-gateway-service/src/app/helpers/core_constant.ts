//
export enum APP_ENV {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  LOCAL = 'local',
}

//common status
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

export enum USER_STATUS {
  INACTIVE = 0,
  ACTIVE = 1,
  DISABLED = 2,
  SUSPENDED = 3,
}

export enum CODE {
  //200
  STATUS_OK = 200,

  //400
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,

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

export enum REGEX {
  BTC_TXID = '^[a-fA-F0-9]{64}$',
  ETH_TXHASH = '^0x[a-fA-F0-9]{64}$',
}

//file types
export const FILE_TYPE_IMAGE = 'image';
export const FILE_TYPE_DOCUMENT = 'document';
export const FILE_TYPE_VIDEO = 'video';
export const FILE_TYPE_AUDIO = 'audio';
export const FILE_TYPE_3D = '_3d';
//

export const DEFAULT_MAX_DATA_SIZE_IN_BYTE = 10000000; // 10 mb
export const DEFAULT_MAX_FILE_UPLOAD_SIZE_IN_BYTE = 2000000; // 2 mb
export const DEFAULT_MAX_FILE_UPLOADS_AT_A_TIME = 10;

export const NEWEST_OR_RECENT_IN_MIN = 4320;

export const VERIFY_CODE_TYPE_AUTH = 1;

export const VERIFY_CODE_RESEND_TIME_IN_SEC = 60;

export const VERIFY_CODE_EXPIRATION_TIME_IN_MIN = 30;

export enum USER_TYPE {
  USER = 'user',
  STAFF = 'staff',
}

export enum ACCOUNT_STATUS {
  PENDING = 1,
  SUCCESSFUL = 2,
}

export enum REG_TYPE {
  REGULAR = 1,
  GOOGLE = 2,
  APPLE = 3,
}

export enum GENDER {
  MALE = 1,
  FEMALE = 2,
  OTHERS = 3,
}

export enum VERIFICATION_CODE_METHOD {
  EMAIL = 1,
  SMS = 2,
  GAUTH = 3,
}

export enum SECURITY_RESET_METHOD {
  EMAIL = 'email',
  PHONE = 'phone',
  GAUTH = 'google2fa_secret',
}

export enum USER_CREDENTIALS {
  EMAIL = 'email',
  PHONE = 'phone',
  USERCODE = 'usercode',
}

export enum VERIFICATION_CODE_EVENT {
  SIGN_UP = 1,
  LOGIN_2FA = 2,
  FORGET_PASSWORD = 3,
  DEVICE_VERIFICATION = 4,
  PASSWORD_CHANGE = 5,
  RESET_SECURITY = 6,
  RESET_CREDENTIAL = 7,
  NEW_EMAIL_VERIFICATION = 8,
  NEW_PHONE_VERIFICATION = 9,
  USER_SECURITY_QUESTION_UPDATE = 10,
  DEVICE_VERIFICATION_ENABLE_DISABLE = 11,
  LOGIN_TWOFA_ENABLE_DISABLE = 12,
  RESET_ANTI_PHISHING_CODE = 13,
  LOGOUT_FROM_OTHER_DEVICE = 14,
  DISABLE_ACCOUNT = 15,
  USER_PAYMENT_METHOD_CRUD = 16,
}

// export enum DEVICE_TYPE {
//   WEB = 1,
//   MOBILE = 2,
// }

export enum DEVICE_TYPE {
  UNKNOWN = 'unknown',
  DESKTOP = 'desktop',
  SMARTPHONE = 'smartphone',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  TELEVISION = 'television',
  SMART_DISPLAY = 'smart display',
  CAMERA = 'camera',
  CAR = 'car',
  CONSOLE = 'Console',
  PROTABLE_MEDIA_PLAYER = 'portable media player',
  PHABLET = 'phablet',
  WEARABLE = 'wearable',
  SMART_SPEAKER = 'smart speaker',
  FEATURE_PHONE = 'feature phone',
  PERIPHERAL = 'peripheral',
}

export enum SECURITY_RESET_STATUS {
  PROCESSING = 0,
  PENDING = 1,
  EXPIRED = 2,
  DONE = 3,
  FAILED = 4,
  REJECT = 5,
}

export enum SECURITY_RESET_STEPS {
  STEP_1_REQUESTED = 1,
  STEP_2_RESET_SUBMIT = 2,
  STEP_3_ANSWER_VERIFIED = 3,
}

export enum ACTIVITY_EVENT {
  LOGIN = 1,
  SECURITY = 2,
}

export enum ACTIVITY {
  //event login
  LOGIN = 1,
  LOGOUT = 2,

  //event security
  NEW_DEVICE_VERIFICATION = 3,
  RESET_PASSWORD = 4,
  CHANGE_PASSWORD = 5,
  RESET_SECURITY_METHOD = 6,
  RESET_CREDENTIAL = 7,
  RESET_ANTI_PHISHING_CODE = 8,
  DEVICE_VERIFICATION_ENABLE_DISABLE = 9,
  LOGIN_TWOFA_ENABLE_DISABLE = 10,
  USER_SECURITY_QUESTION_UPDATE = 11,
  KYC_VERIFICATION = 12,
  LOGOUT_FROM_OTHER_DEVICE = 13,
  DISABLE_ACCOUNT = 14,
}

export const MAXIMUM_RESET_VALUE_TRIES = 3;
export const MAXIMUM_ANSWER_TRIES = 3;

export enum ACTION {
  PROCESSING = 0,
  ACCEPT = 1,
  REJECT = 2,
  FAILED = 3,
  REFUND = 4,
  COMPLETE = 5,
  CANCEL = 6,
}

export enum SECURITY_QUESTION_LIMIT {
  MINIMUM = 1,
  MAXIMUM = 5,
}

export enum KYC_LEVEL {
  ID_VERIFICATION = 1,
  ADDRESS_VERIFICATION = 2,
}

export const RESET_SECURITY_EXPIRATION_IN_MINUTE = 15;
export const RESET_CREDENTIAL_EXPIRATION_IN_MINUTE = 15;

export enum FILESYSTEM_DISK {
  LOCAL = 'local',
  AWS_S3 = 's3',
}

export enum STREAMMING_TYPE {
  STREAM = 'stream',
  BUFFER = 'buffer',
}

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

export enum DEFAULT_DECIMAL {
  FIAT_CURRENCY = 8,
  CRYPTO_CURRENCY = 18,
}

export enum FEE_TYPE {
  PERCENTAGE = 1,
  FIXED = 2,
}

export enum DAYS {
  ONE = 1,
  SEVEN = 7,
  FIFTEEN = 15,
  THIRTY = 30,
}

export enum LOG_FILES {
  DEVICE_TYPE = 'device_type.log',
  EVENTS = 'events.log',
  BULK_MAIL = 'bulk-mail.log',
}

export enum MENU_BIND_TYPE {
  HEADER = 0,
  URL = 1,
  PAGE = 2,
}

export enum NOTICE_TYPE {
  GENERAL_NOTICE = 1,
  SYSTEM_MESSAGE = 2,
  SYSTEM_ACTION_CMD = 3,
}

export enum GENERAL_NOTICE_ALERT_TYPE {
  WARNING = 1,
  INFO = 2,
  ERROR = 3,
}

export enum SYSTEM_ACTION_CMD {
  RELOAD = 1,
}

export const MAX_ACTIVE_NOTICE = 3;

export enum SERIVCE_URL {
  NOTIFICATION_SERVICE = 'http://localhost:3001',
}

// export const ACTIVITY_NOTIFICATION_MAP = {
//   [ACTIVITY.NEW_DEVICE_VERIFICATION]:
//     NOTIFICATION_EVENTS.NEW_DEVICE_VERIFICATION,
//   [ACTIVITY.RESET_PASSWORD]: NOTIFICATION_EVENTS.RESET_PASSWORD,
//   [ACTIVITY.CHANGE_PASSWORD]: NOTIFICATION_EVENTS.UPDATE_PASSWORD,
//   [ACTIVITY.DEVICE_VERIFICATION_ENABLE_DISABLE]:
//     NOTIFICATION_EVENTS.DEVICE_VERIFICATION_ENABLE_DISABLE,
//   [ACTIVITY.LOGIN_TWOFA_ENABLE_DISABLE]:
//     NOTIFICATION_EVENTS.LOGIN_TWOFA_ENABLE_DISABLE,
//   [ACTIVITY.LOGOUT_FROM_OTHER_DEVICE]:
//     NOTIFICATION_EVENTS.LOGOUT_FROM_OTHER_DEVICE,
// };
