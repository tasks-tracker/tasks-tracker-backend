import type { DynamicModule } from '@nestjs/common';
import type { CqrsAdapterModuleSyncOptions } from './module.interfaces';
import type { CqrsAdapterModuleAsyncOptions } from './module.interfaces';

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({})
export class CqrsAdapterModule {
  static register(options: CqrsAdapterModuleSyncOptions): DynamicModule {
    return {
      global: options.isGlobal,
      module: CqrsAdapterModule,
      imports: [CqrsModule.forRoot(options.options)],
      exports: [CqrsModule],
    };
  }

  static registerAsync(options: CqrsAdapterModuleAsyncOptions): DynamicModule {
    return {
      global: options.isGlobal,
      module: CqrsAdapterModule,
      imports: [CqrsModule.forRootAsync(options)],
      exports: [CqrsModule],
    };
  }
}
