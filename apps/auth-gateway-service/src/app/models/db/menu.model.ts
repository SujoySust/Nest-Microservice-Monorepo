import { Field, ObjectType } from '@nestjs/graphql';
import { HiddenIdBaseModelInt } from '../../../libs/model/base.model';
import { TranslationMW } from '../../middlewares/translation.field.middleware';

@ObjectType()
export class BaseMenuModel extends HiddenIdBaseModelInt {
  @Field()
  uid: string;
  @Field(() => String, { middleware: [TranslationMW] })
  title: string;
  position: number;
  bind_type: number;
  status: number;
}

@ObjectType()
export class F_MenuModel extends BaseMenuModel {
  // @Field(() => String, { middleware: [MenuUrlMiddleware], nullabale: true })
  @Field()
  url?: string;
}

@ObjectType()
export class B_MenuModel extends BaseMenuModel {
  @Field()
  url?: string;
}
