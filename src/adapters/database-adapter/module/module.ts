import type { DynamicModule } from '@nestjs/common'

import type { DatabaseModuleOptions } from './module.interfaces.js'
import type { DatabaseModuleAsyncOptions } from './module.interfaces.js'

import { Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise'

import { PG_PROMISE } from '../pg-promise'
import { PgPromiseModule } from '../pg-promise'

@Module({})
export class DatabaseModule {
  constructor() { }

  static register(options: DatabaseModuleOptions): DynamicModule {
    const pgPromiseModule = PgPromiseModule.register(options)
    return {
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
        })
      ],
      module: DatabaseModule,
      providers: [],
      exports: [PgPromiseModule, ClsModule],
    }
  }

  static registerAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const pgPromiseModule = PgPromiseModule.registerAsync(options)
    return {
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
        })
      ],
      module: DatabaseModule,
      providers: [],
      exports: [PgPromiseModule, ClsModule],
    }
  }
}
