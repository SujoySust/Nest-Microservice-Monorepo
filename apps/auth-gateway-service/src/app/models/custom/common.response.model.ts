/* eslint-disable @typescript-eslint/ban-types */
import { Field, HideField, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CountModel {
  @Field({ description: 'count' })
  count?: number;
}

@ObjectType()
export class ResponseModel {
  @Field({ description: 'success' })
  success: boolean;

  @Field({ description: 'message', nullable: true })
  message?: string;

  @HideField()
  messages?: string[];

  @HideField()
  data?: object;

  @Field({ description: 'custom code' })
  code?: number;
}
