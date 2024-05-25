import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseModel } from '../../../app/models/custom/common.response.model';
import { User } from '../../../app/models/db/user.model';
import { secureUserResponseMW } from '../../../app/middlewares/user_gql_resp.field.middlewares';

@ObjectType()
export class LoginResponse extends ResponseModel {
  @Field({ description: 'JWT access token', nullable: true })
  accessToken?: string;

  @Field({ description: 'JWT refresh token', nullable: true })
  refreshToken?: string;

  @Field({ description: 'JWT expiration time', nullable: true })
  expireAt?: Date;

  @Field({ nullable: true })
  deviceToken?: string;

  @Field({ nullable: true })
  deviceTokenExpireAt?: Date;

  @Field(() => User, { middleware: [secureUserResponseMW] })
  user?: User;
}
