import { IsBoolean } from 'class-validator';
import { IsString } from 'class-validator';

import { registerAs } from '@nestjs/config';
import { Yaml } from '@libs/yaml';

@Yaml({
  file:
    process.env.SWAGGER_CONFIG_FILE_PATH ||
    'configs/backend/dev.swagger.config.yml',
  encoding: 'utf-8',
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
