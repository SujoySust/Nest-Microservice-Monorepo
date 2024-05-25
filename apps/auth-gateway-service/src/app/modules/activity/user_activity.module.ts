import { Module } from '@nestjs/common';
import { UserActivityService } from './user_activity.service';

@Module({
  imports: [],
  providers: [UserActivityService],
  exports: [UserActivityService],
})
export class UserActivityModule {}
