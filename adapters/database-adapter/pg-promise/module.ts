import type { DynamicModule } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { Provider } from '@nestjs/common';
import type { IDatabase } from 'pg-promise';
import type { IInitOptions } from 'pg-promise';

import type { PgPromiseModuleOptions } from './module.interfaces';
import type { PgPromiseModuleAsyncOptions } from './module.interfaces';
import type { PgPromiseOptionsFactory } from './module.interfaces';

import { Module } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as pgPromise from 'pg-promise';

import { PG_PROMISE_MODULE_OPTIONS } from './module.constants';
import { PG_PROMISE } from './module.constants';
import { DEFAULT_MAX_RETRIES } from './module.constants';
import { DEFAULT_RETRY_DELAY } from './module.constants';
import { Logger } from 'libs/logger';

@Module({})
export class PgPromiseModule implements OnModuleInit {
  constructor(
    @Inject(PG_PROMISE) private db: IDatabase<any>,
    @Inject(PG_PROMISE_MODULE_OPTIONS)
    private readonly options: PgPromiseModuleOptions,
    private readonly logger: Logger,
  ) {
    logger.setContext(PgPromiseModule.name);
  }

  static register(options: PgPromiseModuleOptions): DynamicModule {
    const pgp = {
      provide: PG_PROMISE,
      useFactory: (opts: PgPromiseModuleOptions, logger: Logger) => {
        logger.setContext(PgPromiseModule.name);
        const initOptions: IInitOptions = {
          query(e) {
            logger.debug('Executing query:', e.query, e.params);
          },
        };
        const pgp = pgPromise(initOptions);
        const db = pgp({
          user: opts.username,
          host: opts.host,
          database: opts.database,
          password: opts.password,
          port: opts.port,
          max: opts.poolSize,
        });
        return db;
      },
      inject: [PG_PROMISE_MODULE_OPTIONS, Logger],
    };

    return {
      module: PgPromiseModule,
      providers: [
        {
          provide: PG_PROMISE_MODULE_OPTIONS,
          useValue: options,
        },
        pgp,
      ],
      exports: [pgp],
    };
  }

  static registerAsync(options: PgPromiseModuleAsyncOptions): DynamicModule {
    const pgp = {
      provide: PG_PROMISE,
      useFactory: (opts: PgPromiseModuleOptions, logger: Logger) => {
        logger.setContext(PgPromiseModule.name);
        const initOptions: IInitOptions = {
          query(e) {
            logger.debug('Executing query:', e.query, e.params);
          },
        };
        const pgp = pgPromise(initOptions);
        const db = pgp({
          user: opts.username,
          host: opts.host,
          database: opts.database,
          password: opts.password,
          port: opts.port,
          max: opts.poolSize,
        });
        return db;
      },
      inject: [PG_PROMISE_MODULE_OPTIONS, Logger],
    };

    return {
      module: PgPromiseModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), pgp],
      exports: [pgp],
    };
  }

  private static createAsyncProviders(
    options: PgPromiseModuleAsyncOptions,
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
    options: PgPromiseModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: PG_PROMISE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: PG_PROMISE_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: PgPromiseOptionsFactory,
      ): PgPromiseModuleOptions | Promise<PgPromiseModuleOptions> =>
        optionsFactory.createModuleOptions(),
      inject: [options.useExisting! || options.useClass!],
    };
  }

  async onModuleInit(): Promise<void> {
    const maxRetries = this.options.maxRetries || DEFAULT_MAX_RETRIES;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.db.connect();
        this.logger.log('Database connection established successfully.');
        return;
      } catch (error) {
        attempt++;
        this.logger.error(
          `Database connection attempt ${attempt} failed.`,
          error,
        );
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise((res) =>
          setTimeout(res, this.options.retryDelay || DEFAULT_RETRY_DELAY),
        );
      }
    }
  }
}
