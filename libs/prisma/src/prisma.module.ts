import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { MongoService } from './mongo.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [PostgresService, MongoService],
  exports: [],
})
export class PrismaModule {}
