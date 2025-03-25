import type { INestApplication } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import { LoggerModule } from '@libs/logger';

export const enableCookieParser = (app: INestApplication) => {
  const logger = LoggerModule.createLoggerByOptions({
    context: 'CookieParser',
  });
  logger.debug(`Enabling cookie parser`);
  app.use(cookieParser());
};
