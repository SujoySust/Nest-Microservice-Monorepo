//

import { ObjectType } from '@nestjs/graphql';
import Paginated from '../../../lib/graphql/pagination/pagination';
import { UserActivityModel } from '../db/user_activity.model';

@ObjectType()
export class UserActivityConnection extends Paginated(UserActivityModel) {}
