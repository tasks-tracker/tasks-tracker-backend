import type { KafkaModuleOptions } from 'adapters/kafka-adapter';

import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { ArrayMinSize } from 'class-validator';

import { Yaml } from 'libs/yaml';

@Yaml({
  file:
    process.env.KAFKA_CONFIG_FILE_PATH ||
    'configs/backend/dev.kafka.config.yml',
  encoding: 'utf-8',
})
export class KafkaConfig implements KafkaModuleOptions {
  @IsString()
  clientId: string;

  @ArrayMinSize(1)
  @IsString({ each: true })
  brokers: Array<string>;
}

export const kafkaConfig = registerAs(
  'kafka',
  (): KafkaConfig => new KafkaConfig(),
);
