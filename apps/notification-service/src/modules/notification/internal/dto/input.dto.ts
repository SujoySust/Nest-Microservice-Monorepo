import { UserModel } from '../../../../../../../libs/helpers/rest/rest.types';
import { Staff } from '../../../../../../../libs/prisma/postgres/clients';
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
