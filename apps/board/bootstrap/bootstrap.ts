import * as dotenv from 'dotenv';
if (process.env.ENV_PATH) dotenv.config({ path: process.env.ENV_PATH });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'libs/logger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'board-group',
        },
      },
    },
  );

  const nestLogger = await app.resolve(Logger);
  nestLogger.setContext('NestJs');
  app.useLogger(nestLogger);

  await app.listen();
}
