import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { serviceConfig } from '../configs';
import { swaggerConfig } from '../configs';
import { cacheConfig } from '../configs';
import { databaseConfig } from '../configs';
import { sessionCookieConfig } from '../configs';
import { loggerConfig } from '../configs';

const configs = [
  loggerConfig,
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
export class ConfigAdapterModule { }
