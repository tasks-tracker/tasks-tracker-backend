import type { INestApplication } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import { Logger } from '@libs/logger';

export const enableCookieParser = async (app: INestApplication) => {
  const logger = await app.resolve(Logger)
  logger.setContext('CookieParser');
  logger.debug(`Enabling cookie parser`);
  app.use(cookieParser());
};
