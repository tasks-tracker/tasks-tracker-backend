import type { DynamicModule } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import type { Provider } from '@nestjs/common';

import type { CacheModuleOptions } from './module.interfaces.js';
import type { CacheModuleAsyncOptions } from './module.interfaces.js';
import type { CacheOptionsFactory } from './module.interfaces.js';

import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';

import { CACHE_MODULE_OPTIONS } from './module.constants.js';
import { Logger } from '@libs/logger';

// TODO: add logger that logs all messages
@Module({})
export class CacheAdapterModule implements OnModuleInit, OnApplicationShutdown {
  constructor(
    private readonly redis: Redis,
    private readonly logger: Logger,
  ) {
    logger.changeOptions({ context: CacheAdapterModule.name });
  }

  static register(options: CacheModuleOptions): DynamicModule {
    const redis = {
      provide: Redis,
      useFactory: (opts: CacheModuleOptions): Redis => new Redis(opts),
      inject: [CACHE_MODULE_OPTIONS],
    };

    return {
      module: CacheAdapterModule,
      providers: [
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: options,
        },
        redis,
      ],
      exports: [redis],
    };
  }

  static registerAsync(options: CacheModuleAsyncOptions): DynamicModule {
    const redis = {
      provide: Redis,
      useFactory: (opts: CacheModuleOptions): Redis => new Redis(opts),
      inject: [CACHE_MODULE_OPTIONS],
    };

    return {
      module: CacheAdapterModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), redis],
      exports: [redis],
    };
  }

  private static createAsyncProviders(
    options: CacheModuleAsyncOptions,
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
    options: CacheModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: CACHE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: CACHE_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: CacheOptionsFactory,
      ): CacheModuleOptions | Promise<CacheModuleOptions> =>
        optionsFactory.createModuleOptions(),
      inject: [options.useExisting! || options.useClass!],
    };
  }

  async onModuleInit(): Promise<void> {
    this.redis.on('error', (error) => {
      this.logger.error(error);
    });
    if (this.redis.status !== 'ready') {
      return new Promise<void>((resolve) => {
        this.redis.once('connect', () => {
          resolve();
        });
      });
    }
  }

  onApplicationShutdown(): void {
    this.redis.disconnect();
  }
}
