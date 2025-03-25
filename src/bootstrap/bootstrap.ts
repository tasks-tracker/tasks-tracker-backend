import * as dotenv from 'dotenv';
if (process.env.ENV_PATH) dotenv.config({ path: process.env.ENV_PATH });

import type { ServiceConfig } from '@adapters/config-adapter';
import type { SwaggerConfig } from '@adapters/config-adapter';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggerModule } from '@libs/logger';
import { loggerConfigRaw } from '@adapters/config-adapter';
import { createNestJsLogger } from './create-nestjs-logger';
import { enableCookieParser } from './cookie-parser';
import { enableSwagger } from './swagger';

export async function bootstrap() {
  LoggerModule.setDefaultOptionsForLogerOutsideDI(loggerConfigRaw);
  const app = await NestFactory.create(AppModule, {
    logger: createNestJsLogger(),
  });
  const configService = app.get(ConfigService);
  const swaggerConfig = configService.get<SwaggerConfig>('swagger')!;
  if (swaggerConfig.enabled)
    enableSwagger(app, { swaggerPrefix: swaggerConfig.swaggerPrefix });
  enableCookieParser(app);
  const serviceConfig = configService.get<ServiceConfig>('service')!;
  await app.listen(serviceConfig.port);
}
