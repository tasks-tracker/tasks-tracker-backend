/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { DynamicModule } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { Provider } from '@nestjs/common';
import type { logCreator } from 'kafkajs';
import type { LogEntry } from 'kafkajs';
import type { Producer } from 'kafkajs';

import type { KafkaModuleOptions } from './module.interfaces';
import type { KafkaModuleAsyncOptions } from './module.interfaces';
import type { KafkaModuleSyncOptions } from './module.interfaces';
import type { KafkaOptionsFactory } from './module.interfaces';

import { Module } from '@nestjs/common';

import { KAFKA_MODULE_OPTIONS } from './module.constants';
import { KAFKA_PRODUCER } from './module.constants';
import { Kafka } from 'kafkajs';
import { logLevel } from 'kafkajs';
import { Logger } from 'libs/logger';
// import { OutboxEventProcessor } from '../processors';

@Module({})
export class KafkaModule implements OnModuleInit {
  constructor(
    private readonly logger: Logger,
    private readonly kafka: Kafka,
  ) {
    logger.setContext(KafkaModule.name);
  }

  private static logCreator(logger: Logger): logCreator {
    return () =>
      ({ namespace, level, log }: LogEntry) => {
        if (level === logLevel.NOTHING)
          logger.debug({
            namespace,
            message: log.message,
            broker: log.broker,
            clientId: log.clientId,
          });
        else if (level === logLevel.ERROR)
          logger.error({
            namespace,
            message: log.message,
            broker: log.broker,
            clientId: log.clientId,
          });
        else if (level === logLevel.WARN)
          logger.warn({
            namespace,
            message: log.message,
            broker: log.broker,
            clientId: log.clientId,
          });
        else if (level === logLevel.INFO)
          logger.log({
            namespace,
            message: log.message,
            broker: log.broker,
            clientId: log.clientId,
          });
        else if (level === logLevel.DEBUG)
          logger.debug({
            namespace,
            message: log.message,
            broker: log.broker,
            clientId: log.clientId,
          });
      };
  }

  static register(options: KafkaModuleSyncOptions): DynamicModule {
    const kafka = {
      provide: Kafka,
      useFactory: (opts: KafkaModuleOptions, logger: Logger): Kafka => {
        logger.setContext(KafkaModule.name);
        return new Kafka({
          ...opts,
          logCreator: KafkaModule.logCreator(logger),
        });
      },
      inject: [KAFKA_MODULE_OPTIONS, Logger],
    };
    const producer = {
      provide: KAFKA_PRODUCER,
      useFactory: async (kafka: Kafka): Promise<Producer> => {
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
      inject: [Kafka],
    };

    return {
      global: options.isGlobal,
      module: KafkaModule,
      providers: [
        {
          provide: KAFKA_MODULE_OPTIONS,
          useValue: options.options,
        },
        kafka,
        producer,
        // OutboxEventProcessor,
      ],
      exports: [kafka, producer],
    };
  }

  static registerAsync(options: KafkaModuleAsyncOptions): DynamicModule {
    const kafka = {
      provide: Kafka,
      useFactory: (opts: KafkaModuleOptions, logger: Logger): Kafka => {
        logger.setContext(KafkaModule.name);
        return new Kafka({
          ...opts,
          logCreator: KafkaModule.logCreator(logger),
        });
      },
      inject: [KAFKA_MODULE_OPTIONS, Logger],
    };

    const producer = {
      provide: KAFKA_PRODUCER,
      useFactory: async (kafka: Kafka): Promise<Producer> => {
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
      inject: [Kafka],
    };

    return {
      global: options.isGlobal,
      module: KafkaModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        kafka,
        producer,
        // OutboxEventProcessor,
      ],
      exports: [kafka, producer],
    };
  }

  private static createAsyncProviders(
    options: KafkaModuleAsyncOptions,
  ): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: KafkaModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: KAFKA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: KAFKA_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: KafkaOptionsFactory,
      ): KafkaModuleOptions | Promise<KafkaModuleOptions> =>
        optionsFactory.createModuleOptions(),
      inject: [options.useExisting! || options.useClass!],
    };
  }

  onModuleInit(): void {
    // const admin = this.kafka.admin();
    // await admin.connect();
    // await admin.disconnect();
    this.logger.log('Kafka connection established.');
  }
}
