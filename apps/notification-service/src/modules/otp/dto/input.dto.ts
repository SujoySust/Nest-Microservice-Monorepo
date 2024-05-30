import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

import {
  OTP_CODE_EVENT,
  OTP_CODE_METHOD,
} from '../../../helpers/notification.constants';
import { USER_TYPE } from '../../../../../../libs/helpers/common/common.constant';

export class SendOtpDto {
  @ApiProperty()
  @IsIn(Object.values(USER_TYPE))
  user_type: USER_TYPE;

  @ApiProperty()
  @IsIn(Object.values(OTP_CODE_METHOD))
  method: number;

  @ApiProperty()
  @IsIn(Object.values(OTP_CODE_EVENT))
  event: number;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsIn(Object.values(USER_TYPE))
  user_type: USER_TYPE;

  @ApiProperty()
  @IsIn(Object.values(OTP_CODE_EVENT))
  event: number;

  @ApiProperty()
  @IsIn(Object.values(OTP_CODE_METHOD))
  method: number;

  @ApiProperty()
  @IsString()
  code: string;
}

export class ValidatePhoneDto {
  @ApiProperty()
  @IsString()
  phone: string;
}
