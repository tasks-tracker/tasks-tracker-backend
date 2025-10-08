import * as cookieParser from 'cookie-parser';

import {
  Global,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'libs/logger';
import {
  CacheConfig,
  ConfigAdapterModule,
  DatabaseConfig,
  KafkaConfig,
  LoggerConfig,
  MetricsConfig,
} from 'adapters/config-adapter';
import { MetricsModule } from 'adapters/metrics-adapter';
import { KafkaModule } from 'adapters/kafka-adapter';
import { helpersProviders } from 'apps/auth/src';
import { CacheAdapterModule } from 'adapters/cache-adapter';
import {
  consumersProviders,
  controllersProviders,
  queryHandlersProviders,
  queryRepositoriesProviders,
  repositoriesProviders,
  servicesProviders,
} from './api-gateway.module-providers';
import { CqrsAdapterModule } from 'adapters/cqrs-adapter';
import { DatabaseModule } from 'adapters/database-adapter';

@Global()
@Module({
  imports: [
    ConfigAdapterModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsAdapterModule.register({
      isGlobal: true,
    }),
    DatabaseModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<DatabaseConfig>('database')!,
      inject: [ConfigService],
    }),
    CacheAdapterModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return configService.get<CacheConfig>('cache')!;
      },
      inject: [ConfigService],
    }),
    MetricsModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<MetricsConfig>('metrics')!,
      inject: [ConfigService],
    }),
    KafkaModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<KafkaConfig>('kafka')!,
      inject: [ConfigService],
    }),
    LoggerModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<LoggerConfig>('logger')!,
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'api-gateway-group',
          },
        },
      },
    ]),
  ],
  controllers: [...controllersProviders],
  providers: [
    ...servicesProviders,
    ...controllersProviders,
    ...queryHandlersProviders,
    ...helpersProviders,
    ...consumersProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ConfigService,
  ],
})
export class ApiGatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
