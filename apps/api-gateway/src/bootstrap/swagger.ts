import type { INestApplication } from '@nestjs/common';

import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

import { Logger } from 'libs/logger';

interface SwaggerOptions {
  swaggerPrefix: string;
}

export const enableSwagger = async (
  app: INestApplication,
  options: SwaggerOptions,
) => {
  const logger = await app.resolve(Logger);
  logger.setContext('Swagger');
  logger.debug(`Swagger is enabled on ${options.swaggerPrefix}`);
  const config = new DocumentBuilder()
    .setTitle('Task Tracker API')
    .setDescription('API для управления задачами и досками')
    .setVersion('1.0')
    .addCookieAuth('session_token')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(options.swaggerPrefix, app, documentFactory);
};
