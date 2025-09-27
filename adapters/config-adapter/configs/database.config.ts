import type { DatabaseModuleOptions } from 'adapters/database-adapter';

import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { Max } from 'class-validator';
import { Min } from 'class-validator';
import { IsBoolean } from 'class-validator';
import { IsInt } from 'class-validator';

import { Yaml } from 'libs/yaml';

@Yaml({
  file:
    process.env.DATABASE_CONFIG_FILE_PATH ||
    'configs/backend/dev.database.config.yml',
  encoding: 'utf-8',
})
export class DatabaseConfig implements DatabaseModuleOptions {
  @IsBoolean()
  ssl: boolean;

  @IsString()
  host: string;

  @Max(65535)
  @Min(1)
  @IsInt()
  port: number;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  database: string;

  @IsInt()
  poolSize: number;
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => new DatabaseConfig(),
);
