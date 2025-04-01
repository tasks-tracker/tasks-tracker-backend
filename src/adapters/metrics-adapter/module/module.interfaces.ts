import type { ModuleMetadata } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common';
import type { OptionalFactoryDependency } from '@nestjs/common';

export interface MetricsModuleOptions {
  authToken?: string;
}

export interface MetricsModuleSyncOptions {
  isGlobal?: boolean;
  options: MetricsModuleOptions;
}

export interface MetricsOptionsFactory {
  createModuleOptions: () =>
    | MetricsModuleOptions
    | Promise<MetricsModuleOptions>;
}

export interface MetricsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  isGlobal?: boolean;
  useExisting?: Type<MetricsModuleOptions>;
  useClass?: Type<MetricsModuleOptions>;
  useFactory?: (
    ...args: Array<any>
  ) => MetricsModuleOptions | Promise<MetricsModuleOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
