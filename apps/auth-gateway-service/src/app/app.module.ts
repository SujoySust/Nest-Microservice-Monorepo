import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SettingModule } from './modules/setting/setting.module';
import { UserActivityModule } from './modules/activity/user_activity.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [SettingModule, UserActivityModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
