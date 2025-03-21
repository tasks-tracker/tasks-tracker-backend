import type { LoggerOptions } from '../core';
import type { ModuleMetadata } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common';
import type { OptionalFactoryDependency } from '@nestjs/common';

export interface LoggerModuleOptions {
  global?: boolean;
  options?: LoggerOptions;
}

export interface LoggerOptionsFactory {
  createLoggerOptions: () => Promise<LoggerModuleOptions> | LoggerModuleOptions;
}

export interface LoggerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  global?: boolean;
  useExisting?: Type<LoggerModuleOptions>;
  useClass?: Type<LoggerModuleOptions>;
  useFactory?: (
    ...args: Array<any>
  ) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
