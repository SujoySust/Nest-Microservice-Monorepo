export enum SETTINGS_VALUE_TYPE {
  TEXT = 1,
  MEDIA_URL = 2,
}

export enum SETTINGS_GROUP {
  APPLICATION = 'application_settings',
  API = 'api_settings',
  GENERAL = 'general_settings',
  EMAIL = 'email_settings',
  LOGO = 'logo_settings',
  SOCIAL = 'social_settings',
  META = 'meta_settings',
}

export enum SETTINGS_SLUG {
  //application settings
  VERIFY_CODE_RESEND_TIME_IN_SEC = 'verify_code_resend_time_in_sec',
  VERIFY_CODE_EXPIRATION_TIME_IN_MIN = 'verify_code_expiration_time_in_min',
  PHONE_2FA_OTP_IS_ENABLED = 'phone_2fa_otp_is_enabled',

  //general_settings
  APPLICATION_TITLE = 'application_title',
  CONTRACT_EMAIL = 'contract_email',
  CONTRACT_PHONE = 'contract_phone',
  ADDRESS = 'address',
  COPY_RIGHT = 'copy_right_text',

  //api_settings
  TWILIO_ACCOUNT_SID = 'twilio_account_sid',
  TWILIO_AUTH_TOKEN = 'twilio_auth_token',
  TWILIO_PHONE_NUMBER = 'twilio_phone_number',

  GOOGLE_AUTH_CLIENT_ID = 'google_auth_client_id',
  GOOGLE_AUTH_CLIENT_SECRET = 'google_auth_client_secret',
  GOOGLE_ANALYTICS_MEASUREMENT_ID = 'google_analytics_measurement_id',

  APPLE_AUTH_SERVICE_ID = 'apple_auth_service_id',
  APPLE_AUTH_BUNDLE_ID = 'apple_auth_bundle_id',
  APPLE_AUTH_TEAM_ID = 'apple_auth_team_id',
  APPLE_AUTH_KEY_ID = 'apple_auth_key_id',
  APPLE_AUTH_REDIRECT_URL = 'apple_auth_redirect_url',

  SENTRY_DSN = 'sentry_dsn',

  IP_INFO_TOKEN = 'ip_info_token',

  AWS_S3_BUCKET = 'aws_s3_bucket',
  AWS_S3_ACCESS_KEY = 'aws_s3_access_key',
  AWS_S3_KEY_SECRET = 'aws_s3_key_secret',
  AWS_S3_REGION = 'aws_s3_region',

  //email_settings
  MAIL_DIRIVER = 'mail_driver',
  MAIL_HOST = 'mail_host',
  MAIL_PORT = 'mail_port',
  MAIL_USERNAME = 'mail_username',
  MAIL_PASSWORD = 'mail_password',
  MAIL_ENCRYPTION = 'mail_encryption',
  MAIL_FROM_ADDRESS = 'mail_from_address',
  MAIL_FROM_NAME = 'mail_from_name',

  //logo_settings
  APP_LOGO_LARGE = 'app_logo_large',
  APP_LOGO_SMALL = 'app_logo_small',
  FAVICON_LOGO = 'favicon_logo',
  AUTH_LEFT_IMAGE = 'auth_left_image',

  //social_settings
  FACEBOOK_LINK = 'facebook_link',
  TWITTER_LINK = 'twitter_link',
  INSTAGRAM_LINK = 'instagram_link',
  DISCORD_LINK = 'discord_link',
  WHATSAPP_LINK = 'whatsapp_link',
  LINKEDIN_LINK = 'linkedin_link',
  //

  //meta_settings
  META_TITLE = 'meta_title',
  META_TYPE = 'meta_type',
  META_DESCRIPTION = 'meta_description',
  META_IMAGE_URL = 'meta_image_url',
  //
}
