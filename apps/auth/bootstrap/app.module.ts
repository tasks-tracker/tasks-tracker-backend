import type { LoggerConfig } from '../../../adapters/config-adapter';
import type { DatabaseConfig } from '../../../adapters/config-adapter';
import type { MetricsConfig } from '../../../adapters/config-adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigAdapterModule } from '../../../adapters/config-adapter';
import { CqrsAdapterModule } from '../../../adapters/cqrs-adapter';
import { LoggerModule } from '../../../libs/logger';
import { DatabaseModule } from '../../../adapters/database-adapter';
import { MetricsModule } from '../../../adapters/metrics-adapter';
import { AuthModule } from '../src';
import { MiddlewareConsumer } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigAdapterModule,
    ScheduleModule.forRoot(),
    LoggerModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<LoggerConfig>('logger')!,
      inject: [ConfigService],
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
    MetricsModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<MetricsConfig>('metrics')!,
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
            groupId: 'auth-consumer-group',
          },
        },
      },
    ]),
    AuthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser())
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
