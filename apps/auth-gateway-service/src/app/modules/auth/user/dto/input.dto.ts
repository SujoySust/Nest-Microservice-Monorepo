import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ResponseModel } from '../../../../models/custom/common.response.model';

import { Match } from '../../../../../lib/decorators/match.decorator';
import { Unique } from '../../../../../lib/decorators/unique.decorator';

import {
  VERIFICATION_CODE_EVENT,
  VERIFICATION_CODE_METHOD,
} from '../../../../helpers/core_constant';
import { __ } from '../../../../helpers/core_function';

@InputType()
export class SendAuthVerifyCodeInput {
  @Field()
  @IsNotEmpty()
  user_code: string;

  @Field()
  @IsInt()
  @IsNotEmpty()
  event: VERIFICATION_CODE_EVENT;

  @Field()
  @IsInt()
  @IsNotEmpty()
  method: VERIFICATION_CODE_METHOD;
}

@InputType()
export class VerifyAuthCodeInput {
  @Field()
  @IsNotEmpty()
  user_code: string;

  @Field()
  @IsInt()
  @IsNotEmpty()
  event: VERIFICATION_CODE_EVENT;

  @Field()
  @IsInt()
  @IsNotEmpty()
  method: VERIFICATION_CODE_METHOD;

  @Field()
  @IsNotEmpty()
  code: string;
}

@InputType()
export class EmailVerifyInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @MinLength(6)
  @IsNotEmpty()
  verify_code: string;
}

@InputType()
export class PhoneVerifyInput {
  @Field()
  @IsNotEmpty()
  phone: string;

  @Field()
  @MinLength(6)
  @IsNotEmpty()
  verify_code: string;
}

@InputType()
export class SendForgotPasswordOtpInput {
  @Field({ nullable: true })
  email?: string;
  @Field({ nullable: true })
  phone?: string;
}

@InputType()
export class UserLoginInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  @MinLength(8)
  @IsNotEmpty()
  password?: string;
}

@InputType()
export class UserSocialLoginInput {
  @Field(() => String)
  token: string;

  @Field(() => Int)
  reg_type: number;
}

@InputType()
export class PasswordResetInput {
  @Field()
  @MinLength(6)
  @IsNotEmpty({
    message: () => __('Verify code can not be empty'),
  })
  code: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  @Matches(
    /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
      message: () =>
        __(
          'Password too weak. Use combination of number, alphabet and special character.',
        ),
    },
  )
  @MinLength(8)
  @IsNotEmpty({
    message: () => __('Password can not be empty'),
  })
  password: string;

  @Field()
  @Match('password', {
    message: () => __('Password and confirm password should be same'),
  })
  @MinLength(8)
  @IsNotEmpty({
    message: () => __('Confirm password can not be empty'),
  })
  password_confirm: string;
}

@InputType()
export class SignupInput {
  @Field({ nullable: true })
  @Unique('User', {
    message: () => __('Email already used.'),
  })
  email?: string;

  @Field({ nullable: true })
  nickname?: string;

  @Field({ nullable: true })
  @Unique('User', {
    message: () => __('Phone number already used.'),
  })
  phone?: string;

  @Field()
  @Matches(
    /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
      message: () =>
        __(
          'Password too weak. Use combination of number, alphabet and special character.',
        ),
    },
  )
  @MinLength(8)
  @MaxLength(20)
  @IsNotEmpty({
    message: () => __('Password can not be empty'),
  })
  password: string;

  @Field()
  @Match('password', {
    message: () => __('Password and confirm password should be same'),
  })
  @MinLength(8)
  @IsNotEmpty({
    message: () => __('Confirm password can not be empty'),
  })
  password_confirm: string;

  @Field({ nullable: true })
  referral_code?: string;
}

@ObjectType()
export class DeviceToken extends ResponseModel {
  @Field()
  device_token: string;
}
