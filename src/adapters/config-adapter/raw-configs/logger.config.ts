import { LOG_LEVELS } from '@libs/logger';

import { IsBoolean } from 'class-validator';
import { IsEnum } from 'class-validator';
import { IsNumber } from 'class-validator';
import { Yaml } from '@libs/yaml';

@Yaml({
  file: process.env.LOGGER_CONFIG_FILE_PATH || 'configs/logger.config.yml',
  encoding: 'utf-8',
})
class LoggerConfig {
  @IsEnum(LOG_LEVELS)
  logLevel: string;

  @IsBoolean()
  colors: boolean;

  @IsNumber()
  space: number;
}

export const loggerConfigRaw = new LoggerConfig();
