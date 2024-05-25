import { Controller, Post, Body } from '@nestjs/common';
import { SendNotificationDto } from './dto/input.dto';
import { NotificationService } from './notification.service';
import { ApiHeaders, ApiResponse } from '@nestjs/swagger';
import {
  ResponseModel,
  UserModel,
} from '../../../../../libs/helpers/rest/rest.types';
import { UserEntity } from '../../../../../libs/decorators/rest/parse_user.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

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
  @ApiResponse({ type: ResponseModel })
  @Post('/send')
  send(
    @Body() data: SendNotificationDto,
    @UserEntity() user: UserModel,
  ): Promise<ResponseModel> {
    return this.service.send(user, data);
  }
}
