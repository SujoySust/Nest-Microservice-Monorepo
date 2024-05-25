import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { Match } from '../../../../../lib/decorators/match.decorator';
import { __ } from '../../../../../../../../libs/helpers/common/common.functions';

@InputType()
export class StaffLoginInput {
  @Field()
  username: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

@InputType()
export class SendStaffForgotPasswordEmailInput {
  @Field(() => String)
  @IsEmail({}, { message: () => __('Invalid email!') })
  email: string;
}

@InputType()
export class StaffPasswordResetInput {
  @Field()
  @MinLength(6)
  @IsNotEmpty({
    message: () => __('Verify code can not be empty'),
  })
  code: string;

  @Field({ nullable: true })
  email?: string;

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
