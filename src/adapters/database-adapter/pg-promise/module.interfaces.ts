import type { ModuleMetadata } from '@nestjs/common'
import type { Type } from '@nestjs/common'
import type { InjectionToken } from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'

export type PgPromiseOptions = {
  ssl: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  poolSize: number;
  maxRetries?: number;
  retryDelay?: number;
};

export interface PgPromiseModuleOptions extends PgPromiseOptions { }

export interface PgPromiseOptionsFactory {
  createModuleOptions: () => PgPromiseModuleOptions | Promise<PgPromiseModuleOptions>
}

export interface PgPromiseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<PgPromiseModuleOptions>
  useClass?: Type<PgPromiseModuleOptions>
  useFactory?: (...args: Array<any>) => PgPromiseModuleOptions | Promise<PgPromiseModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
