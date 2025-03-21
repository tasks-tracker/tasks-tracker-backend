import * as dotenv from 'dotenv';
if (process.env.ENV_PATH) dotenv.config({ path: process.env.ENV_PATH });

import type { ServiceConfig } from './adapters';
import type { SwaggerConfig } from './adapters';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggerModule } from './libs';
import { loggerConfigRaw } from './adapters';
import { createNestJsLogger } from './boostrap';
import { enableSwagger } from './boostrap';

async function bootstrap() {
  LoggerModule.setDefaultOptionsForLogerOutsideDI(loggerConfigRaw);
  const app = await NestFactory.create(AppModule, {
    logger: createNestJsLogger(),
  });
  const configService = app.get(ConfigService);
  const swaggerConfig = configService.get<SwaggerConfig>('swagger')!;
  if (swaggerConfig.enabled)
    enableSwagger(app, { swaggerPrefix: swaggerConfig.swaggerPrefix });
  const serviceConfig = configService.get<ServiceConfig>('service')!;
  await app.listen(serviceConfig.port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
