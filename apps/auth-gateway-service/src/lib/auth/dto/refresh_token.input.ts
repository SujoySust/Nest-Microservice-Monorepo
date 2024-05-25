import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty } from 'class-validator';
import { Staff } from '../../../app/models/db/staff.model';
import { ResponseModel } from '../../../app/models/custom/common.response.model';

@ArgsType()
export class RefreshTokenInput {
  @IsNotEmpty()
  @IsJWT()
  token: string;
}

@ObjectType()
export class Token extends ResponseModel {
  @Field({ description: 'JWT access token', nullable: true })
  accessToken?: string;

  @Field({ description: 'JWT refresh token', nullable: true })
  refreshToken?: string;

  @Field({ description: 'JWT expiration time', nullable: true })
  expireAt?: Date;

  @Field(() => Staff)
  user?: Staff;
}
