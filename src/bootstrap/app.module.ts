import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAdapterModule } from '@adapters/config-adapter';
import { CqrsAdapterModule } from '@adapters/cqrs-adapter';
import { LoggerModule } from '@libs/logger';
import { DatabaseModule } from '@adapters/database-adapter';
import { MetricsModule } from '@adapters/metrics-adapter';
import { AuthModule } from '@contexts/auth';

@Module({
  imports: [
    ConfigAdapterModule,
    LoggerModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => configService.get('logger')!,
      inject: [ConfigService],
    }),
    CqrsAdapterModule,
    DatabaseModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
      inject: [ConfigService],
    }),
    MetricsModule,
    // AuthModule,
  ],
})
export class AppModule { }
