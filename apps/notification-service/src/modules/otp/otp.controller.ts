import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto, ValidatePhoneDto, VerifyOtpDto } from './dto/input.dto';
import { ApiHeaders } from '@nestjs/swagger';
import { UserEntity } from '../../../libs/decorators/parse_user.decorator';
import { UserModel } from '../../helpers/core_types';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @ApiHeaders([
    {
      name: 'X-User-ID',
      description: 'user id',
    },
    {
      name: 'lang',
      description: 'lang key',
    },
  ])
  @Post('/send')
  send(@Body() data: SendOtpDto, @UserEntity() user: UserModel) {
    console.log('called otp service');
    return this.otpService.send(user, data);
  }

  @Post('/verify')
  verify(@Body() data: VerifyOtpDto, @UserEntity() user: UserModel) {
    return this.otpService.verify(user, data);
  }

  @Post('/validate/phone')
  validatePhone(@Body() data: ValidatePhoneDto) {
    return this.otpService.validatePhone(data.phone);
  }
}
