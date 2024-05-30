import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../../libs/prisma/src/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphqlConfig } from './configs/config.interface';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, resolve } from 'path';
import { GraphQLConfig } from './configs/graphql.config';
import { AppModule } from './app/app.module';
import { JWTConfig } from './configs/security.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        GraphQLConfig,
        JWTConfig
      ],
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve('public'),
      exclude: ['/graphql*'],
    }),
    // LocalizationModule.register({
    //   path: process.env.BASE_PROJECT_PATH
    //     ? join(process.env.BASE_PROJECT_PATH, 'resources/lang/')
    //     : join(__dirname, '../..', 'resources/lang/'),
    //   fallbackLang: 'en',
    // }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async (configService: ConfigService) => {
        const graphqlConfig = configService.get<GraphqlConfig>('graphql');
        return {
          subscriptions: {
            // 'graphql-ws': true,
            'graphql-ws': {
              onConnect: graphqlConfig.wsOnConnect,
              onDisconnect: graphqlConfig.wsOnDisconnect,
            },
            // 'subscriptions-transport-ws': true,
            // 'subscriptions-transport-ws': {
            //   onConnect: graphqlConfig.wsOnConnect,
            // },
          },
          introspection: graphqlConfig.introspection,
          buildSchemaOptions: {
            numberScalarMode: 'integer',
          },
          sortSchema: graphqlConfig.sortSchema,
          autoSchemaFile:
            graphqlConfig.schemaDestination || './src/schema.graphql',
          debug: graphqlConfig.debug,
          playground: graphqlConfig.playgroundEnabled,
          formatError: graphqlConfig.formatError,
          context: ({ req, res, extra, connectionParams, connection }) => ({
            req,
            res,
            extra,
            connectionParams,
            connection,
          }), // extra, connectionParams & connection is for ws req data
        };
      },
      inject: [ConfigService],
    }),
    // ThrottlerModule.forRoot({
    //   storage: new ThrottlerStorageRedisService({
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: Number(process.env.REDIS_PORT) || 6379,
    //     username: process.env.REDIS_USERNAME || undefined,
    //     password: process.env.REDIS_PASSWORD || undefined,
    //     db: Number(process.env.REDIS_DATABASE) || 0,
    //   }),
    //   throttlers: [
    //     {
    //       ttl: 60000,
    //       limit: Number(process.env.REQUEST_LIMIT_PER_MINUTE || 0) || 60,
    //     },
    //   ],
    // }),
    PrismaModule,
    AppModule
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
