import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { serviceConfig, swaggerConfig } from '../configs'

const configs = [
  serviceConfig,
  swaggerConfig,
]

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
