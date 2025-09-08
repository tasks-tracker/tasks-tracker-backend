import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';
import { IsBoolean } from 'class-validator';
import { IsNumber } from 'class-validator';

import { Yaml } from '@libs/yaml';

@Yaml({
  file:
    process.env.CORS_CONFIG_FILE_PATH || 'configs/backend/dev.cors.config.yml',
  encoding: 'utf-8',
})
export class CorsConfig implements CorsOptions {
  /**
   * Configures the `Access-Control-Allow-Origins` CORS header.  See [here for more detail.](https://github.com/expressjs/cors#configuration-options)
   */
  @IsString({ each: true })
  @IsOptional()
  origin?: Array<string>;

  /**
   * Configures the Access-Control-Allow-Methods CORS header.
   */
  @IsString({ each: true })
  @IsOptional()
  methods?: Array<string>;

  /**
   * Configures the Access-Control-Allow-Headers CORS header.
   */
  @IsString({ each: true })
  @IsOptional()
  allowedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Expose-Headers CORS header.
   */
  @IsString({ each: true })
  @IsOptional()
  exposedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Allow-Credentials CORS header.
   */
  @IsBoolean()
  @IsOptional()
  credentials?: boolean;

  /**
   * Configures the Access-Control-Max-Age CORS header.
   */
  @IsNumber()
  @IsOptional()
  maxAge?: number;

  /**
   * Whether to pass the CORS preflight response to the next handler.
   */
  @IsBoolean()
  @IsOptional()
  preflightContinue?: boolean;

  /**
   * Provides a status code to use for successful OPTIONS requests.
   */
  @IsNumber()
  @IsOptional()
  optionsSuccessStatus?: number;
}

export const corsConfig = registerAs(
  'cors',
  (): CorsConfig => new CorsConfig(),
);
