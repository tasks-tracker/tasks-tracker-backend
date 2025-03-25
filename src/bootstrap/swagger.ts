import type { INestApplication } from '@nestjs/common';

import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

import { LoggerModule } from '@libs/logger';

interface SwaggerOptions {
  swaggerPrefix: string;
}

export const enableSwagger = (
  app: INestApplication,
  options: SwaggerOptions,
) => {
  const logger = LoggerModule.createLoggerByOptions({ context: 'Swagger' });
  logger.debug(`Swagger is enabled on ${options.swaggerPrefix}`);
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addCookieAuth('session_token')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(options.swaggerPrefix, app, documentFactory);
};
