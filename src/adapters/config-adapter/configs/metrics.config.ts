import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

import { Yaml } from '@libs/yaml';

@Yaml({
  file:
    process.env.METRICS_CONFIG_FILE_PATH ||
    'configs/backend/dev.metrics.config.yml',
  encoding: 'utf-8',
})
export class MetricsConfig {
  @IsString()
  @IsOptional()
  authToken?: string;
}

export const metricsConfig = registerAs(
  'metrics',
  (): MetricsConfig => new MetricsConfig(),
);
