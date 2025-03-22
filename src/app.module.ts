import type { CacheConfig } from './adapters';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAdapterModule } from './adapters';
import { loggerConfigRaw } from './adapters';
import { CqrsAdapterModule } from './adapters';
import { CacheAdapterModule } from './adapters';
import { LoggerModule } from './libs';
import { DatabaseModule } from './adapters';
import { AuthModule } from './contexts';

@Module({
  imports: [
    LoggerModule.register({
      global: true,
      options: loggerConfigRaw,
    }),
    ConfigAdapterModule,
    CqrsAdapterModule,
    CacheAdapterModule.registerAsync({
      useFactory: (
        configService: ConfigService,
      ) => configService.get<CacheConfig>('cache')!,
      inject: [ConfigService],
    }),
    DatabaseModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
      inject: [ConfigService],
    }),
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
