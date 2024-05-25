import {
  ResponseModel,
  UserModel,
} from '../../../../../libs/helpers/rest/rest.types';

export interface NotificationInterface<T> {
  send(user: UserModel, data: T): Promise<ResponseModel>;
}
