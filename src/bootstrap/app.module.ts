import type { LoggerConfig } from '@adapters/config-adapter';
import type { DatabaseConfig } from '@adapters/config-adapter';
import type { KafkaConfig } from '@adapters/config-adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAdapterModule } from '@adapters/config-adapter';
import { CqrsAdapterModule } from '@adapters/cqrs-adapter';
import { LoggerModule } from '@libs/logger';
import { DatabaseModule } from '@adapters/database-adapter';
import { MetricsModule } from '@adapters/metrics-adapter';
import { KafkaModule } from '@adapters/kafka-adapter';
import { AuthModule } from '@contexts/auth';
import { MiddlewareConsumer } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigAdapterModule,
    LoggerModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<LoggerConfig>('logger')!,
      inject: [ConfigService],
    }),
    CqrsAdapterModule,
    DatabaseModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<DatabaseConfig>('database')!,
      inject: [ConfigService],
    }),
    KafkaModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<KafkaConfig>('kafka')!,
      inject: [ConfigService],
    }),
    MetricsModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get('metrics')!,
      inject: [ConfigService],
    }),
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
