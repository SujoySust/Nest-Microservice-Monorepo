// import { User } from '../../../models/db/user.model';

import { Staff } from '@prisma/client';

import { UserModel } from '../../../../helpers/core_types';
import { USER_NOTIFY_TYPE } from '../../../../helpers/notification.constants';
export class UserNotificationInput {
  user: UserModel;
  title: string;
  notify_type?: USER_NOTIFY_TYPE;
  description?: string;
}
export class UserInternalNotifyFindManyArgs {
  user: UserModel;
  limit?: number;
}
export class StaffInternalNotifyFindManyArgs {
  staff: Staff;
  limit?: number;
}
