import type { ModuleMetadata } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common';
import type { OptionalFactoryDependency } from '@nestjs/common';
import type { PgPromiseModuleOptions } from '../pg-promise';

export interface DatabaseModuleOptions extends PgPromiseModuleOptions {}

export interface DatabaseOptionsFactory {
  createModuleOptions: () =>
    | DatabaseModuleOptions
    | Promise<DatabaseModuleOptions>;
}

export interface DatabaseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<DatabaseModuleOptions>;
  useClass?: Type<DatabaseModuleOptions>;
  useFactory?: (
    ...args: Array<any>
  ) => DatabaseModuleOptions | Promise<DatabaseModuleOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
