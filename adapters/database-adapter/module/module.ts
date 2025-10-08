import type { DynamicModule } from '@nestjs/common';

import type { DatabaseModuleSyncOptions } from './module.interfaces.js';
import type { DatabaseModuleAsyncOptions } from './module.interfaces.js';

import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';

import { PG_PROMISE } from '../pg-promise';
import { PgPromiseModule } from '../pg-promise';
import { OutboxRepository } from '../repositories';
import { OutboxSchedulerService } from '../schedulers';

@Module({})
export class DatabaseModule {
  constructor() {}

  static register(options: DatabaseModuleSyncOptions): DynamicModule {
    const pgPromiseModule = PgPromiseModule.register(options.options);
    return {
      global: options.isGlobal,
      imports: [
        pgPromiseModule,
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              imports: [pgPromiseModule],
              adapter: new TransactionalAdapterPgPromise({
                dbInstanceToken: PG_PROMISE,
              }),
              enableTransactionProxy: true,
            }),
          ],
        }),
      ],
      module: DatabaseModule,
      providers: [OutboxRepository, OutboxSchedulerService],
      exports: [pgPromiseModule, ClsModule, OutboxRepository],
    };
  }

  static registerAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const pgPromiseModule = PgPromiseModule.registerAsync(options);
    return {
      global: options.isGlobal,
      imports: [
        pgPromiseModule,
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              imports: [pgPromiseModule],
              adapter: new TransactionalAdapterPgPromise({
                dbInstanceToken: PG_PROMISE,
              }),
              enableTransactionProxy: true,
            }),
          ],
        }),
      ],
      module: DatabaseModule,
      providers: [],
      exports: [pgPromiseModule, ClsModule],
    };
  }
}
