import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  serviceConfig,
  swaggerConfig,
  cacheConfig,
  databaseConfig,
  sessionCookieConfig,
} from '../configs';

const configs = [
  serviceConfig,
  swaggerConfig,
  cacheConfig,
  databaseConfig,
  sessionCookieConfig,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
  ],
  exports: [ConfigModule],
})
export class ConfigAdapterModule {}
