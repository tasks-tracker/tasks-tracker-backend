import * as dotenv from 'dotenv';
if (process.env.ENV_PATH) dotenv.config({ path: process.env.ENV_PATH });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '../../../libs/logger';
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
          groupId: 'auth-consumer-group',
        },
      },
    },
  );

  const nestLogger = await app.resolve(Logger);
  nestLogger.setContext('NestJs');
  app.useLogger(nestLogger);

  nestLogger.log('Auth microservice starting...', 'Bootstrap');
  await app.listen();
  nestLogger.log('Auth microservice is listening for messages', 'Bootstrap');
}
