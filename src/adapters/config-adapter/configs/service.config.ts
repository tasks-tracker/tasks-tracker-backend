import { registerAs } from '@nestjs/config';
import { Max } from 'class-validator';
import { Min } from 'class-validator';
import { IsInt } from 'class-validator';

import { Yaml } from '@libs/yaml';

@Yaml({
  file: process.env.SERVICE_CONFIG_FILE_PATH || 'configs/service.config.yml',
  encoding: 'utf-8',
})
export class ServiceConfig {
  @Max(65535)
  @Min(1)
  @IsInt()
  port: number;
}

export const serviceConfig = registerAs(
  'service',
  (): ServiceConfig => new ServiceConfig(),
);
