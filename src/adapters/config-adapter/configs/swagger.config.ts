import { LoggerModule } from '../../../libs';

import { IsBoolean } from 'class-validator';
import { IsString } from 'class-validator';

import { loggerConfigRaw } from '../raw-configs';
import { registerAs } from '@nestjs/config';
import { Yaml } from '../../../libs';

@Yaml({
  file:
    process.env.SWAGGER_CONFIG_FILE_PATH ||
    'configs/swagger.config.yml',
  encoding: 'utf-8',
  logger: LoggerModule.createLoggerByOptions({
    context: 'SwaggerConfig',
    ...loggerConfigRaw,
  }),
})
export class SwaggerConfig {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  swaggerPrefix: string;
}

export const swaggerConfig = registerAs(
  'swagger',
  (): SwaggerConfig => new SwaggerConfig(),
);
