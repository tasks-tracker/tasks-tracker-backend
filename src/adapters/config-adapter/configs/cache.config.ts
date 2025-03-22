import type { CacheModuleOptions } from 'src/adapters/cache-adapter';
import { LoggerModule } from '../../../libs/logger';

import { registerAs } from '@nestjs/config';
import { Max } from 'class-validator';
import { Min } from 'class-validator';
import { IsInt } from 'class-validator';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

import { loggerConfigRaw } from '../raw-configs';
import { Yaml } from '../../../libs/yaml';

@Yaml({
  file: process.env.CACHE_CONFIG_FILE_PATH || 'configs/cache.config.yml',
  encoding: 'utf-8',
  logger: LoggerModule.createLoggerByOptions({
    context: 'CacheConfig',
    ...loggerConfigRaw,
  }),
})
export class CacheConfig implements CacheModuleOptions {
  @Max(65535)
  @Min(1)
  @IsInt()
  port: number;

  @IsOptional()
  @IsString()
  host: string;
}

export const cacheConfig = registerAs(
  'cache',
  (): CacheConfig => new CacheConfig(),
);
