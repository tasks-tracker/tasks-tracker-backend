import * as dotenv from 'dotenv';
if (process.env.ENV_PATH) dotenv.config({ path: process.env.ENV_PATH });

import type { ServiceConfig } from '@adapters/config-adapter';
import type { SwaggerConfig } from '@adapters/config-adapter';
import type { CorsConfig } from '@adapters/config-adapter';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { enableSwagger } from './swagger';
import { Logger } from '@libs/logger';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const nestLogger = await app.resolve(Logger);
  nestLogger.setContext('NestJs');
  app.useLogger(nestLogger);
  const configService = app.get(ConfigService);
  const corsConfig = configService.get<CorsConfig>('cors')!;
  app.enableCors(corsConfig);
  const swaggerConfig = configService.get<SwaggerConfig>('swagger')!;
  if (swaggerConfig.enabled)
    await enableSwagger(app, { swaggerPrefix: swaggerConfig.swaggerPrefix });
  const serviceConfig = configService.get<ServiceConfig>('service')!;
  await app.listen(serviceConfig.port);
}
