import type { CqrsModuleOptions } from '@nestjs/cqrs';
import type { CqrsModuleAsyncOptions } from '@nestjs/cqrs';

export interface CqrsAdapterModuleSyncOptions {
  isGlobal?: boolean;
  options?: CqrsModuleOptions;
}

export interface CqrsAdapterModuleAsyncOptions extends CqrsModuleAsyncOptions {
  isGlobal?: boolean;
}
