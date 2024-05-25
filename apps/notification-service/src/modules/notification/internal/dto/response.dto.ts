import { UserNotification } from '@prisma/client';
import { USER_NOTIFY_TYPE } from '../../../../helpers/notification.constants';

export class UserNotificationDateRes {
  title: string;
  description: string;
  notify_type?: USER_NOTIFY_TYPE;
}

export class UserNotificationEvent {
  slug: string;
  name: string;
}

export class UserNotificationListRes {
  unread_count: number;
  notifications: UserNotification[]; // TODO: change this
}
