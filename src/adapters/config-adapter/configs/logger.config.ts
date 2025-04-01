import type { LoggerModuleOptions } from '@libs/logger';
import { LOG_LEVELS } from '@libs/logger';

import { registerAs } from '@nestjs/config';
import { IsBoolean } from 'class-validator';
import { IsEnum } from 'class-validator';
import { IsNumber } from 'class-validator';
import { Yaml } from '@libs/yaml';

@Yaml({
  file: process.env.LOGGER_CONFIG_FILE_PATH || 'configs/logger.config.yml',
  encoding: 'utf-8',
})
export class LoggerConfig implements LoggerModuleOptions {
  @IsEnum(LOG_LEVELS)
  logLevel: string;

  @IsBoolean()
  colors: boolean;

  @IsNumber()
  space: number;
}

export const loggerConfig = registerAs(
  'logger',
  (): LoggerConfig => new LoggerConfig(),
);
