import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAdapterModule } from '@adapters/config-adapter';
import { loggerConfigRaw } from '@adapters/config-adapter';
import { CqrsAdapterModule } from '@adapters/cqrs-adapter';
import { LoggerModule } from '@libs/logger';
import { DatabaseModule } from '@adapters/database-adapter';
import { MetricsModule } from '@adapters/metrics-adapter';
import { AuthModule } from './contexts';

@Module({
  imports: [
    LoggerModule.register({
      global: true,
      options: loggerConfigRaw,
    }),
    ConfigAdapterModule,
    CqrsAdapterModule,
    DatabaseModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
      inject: [ConfigService],
    }),
    MetricsModule,
    AuthModule,
  ],
})
export class AppModule { }
