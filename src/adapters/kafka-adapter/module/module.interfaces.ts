import type { ModuleMetadata } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common';
import type { OptionalFactoryDependency } from '@nestjs/common';
import type { KafkaConfig } from 'kafkajs';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KafkaModuleOptions extends KafkaConfig { }

export interface KafkaModuleSyncOptions {
  isGlobal?: boolean;
  options: KafkaModuleOptions;
}

export interface KafkaOptionsFactory {
  createModuleOptions: () =>
    | KafkaModuleOptions
    | Promise<KafkaModuleOptions>;
}

export interface KafkaModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  isGlobal?: boolean;
  useExisting?: Type<KafkaModuleOptions>;
  useClass?: Type<KafkaModuleOptions>;
  useFactory?: (
    ...args: Array<any>
  ) => KafkaModuleOptions | Promise<KafkaModuleOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
