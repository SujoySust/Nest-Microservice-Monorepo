import {
  EXTERNAL_NOTIFICATION_METHOD,
  NOTIFICATION_TYPE,
} from '../../../helpers/notification.constants';

export class NotificationData {
  title?: string;
  description?: string;
  subject?: string;
}

export class NotificationEventData {
  [NOTIFICATION_TYPE.INTERNAL]: NotificationData;
  [NOTIFICATION_TYPE.EXTERNAL]: {
    [EXTERNAL_NOTIFICATION_METHOD.EMAIL]: NotificationData;
    [EXTERNAL_NOTIFICATION_METHOD.SMS]: NotificationData;
  };
  [NOTIFICATION_TYPE.BOTH]: {
    [NOTIFICATION_TYPE.INTERNAL]: NotificationData;
    [NOTIFICATION_TYPE.EXTERNAL]: {
      [EXTERNAL_NOTIFICATION_METHOD.EMAIL]: NotificationData;
      [EXTERNAL_NOTIFICATION_METHOD.SMS]: NotificationData;
    };
  };
}
