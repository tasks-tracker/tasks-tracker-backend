import * as dotenv from 'dotenv';
if (process.env.ENV_PATH) dotenv.config({ path: process.env.ENV_PATH });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerModule } from './libs';
import { loggerConfigRaw } from './adapters';
import { createNestJsLogger } from './boostrap';

async function bootstrap() {
  LoggerModule.setDefaultOptionsForLogerOutsideDI(loggerConfigRaw);
  const app = await NestFactory.create(AppModule, {
    logger: createNestJsLogger(),
  });
  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
