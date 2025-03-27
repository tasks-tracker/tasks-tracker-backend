import type { ModuleMetadata } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common';
import type { OptionalFactoryDependency } from '@nestjs/common';
import type { PgPromiseModuleOptions } from '../pg-promise';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatabaseModuleOptions extends PgPromiseModuleOptions { }

export interface DatabaseModuleSyncOptions {
  isGlobal?: boolean;
  options: DatabaseModuleOptions;
}

export interface DatabaseOptionsFactory {
  createModuleOptions: () =>
    | DatabaseModuleOptions
    | Promise<DatabaseModuleOptions>;
}

export interface DatabaseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  isGlobal?: boolean;
  useExisting?: Type<DatabaseModuleOptions>;
  useClass?: Type<DatabaseModuleOptions>;
  useFactory?: (
    ...args: Array<any>
  ) => DatabaseModuleOptions | Promise<DatabaseModuleOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
