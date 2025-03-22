import type { ModuleMetadata } from '@nestjs/common'
import type { Type } from '@nestjs/common'
import type { InjectionToken } from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'
import type { RedisOptions } from 'ioredis'

export interface CacheModuleOptions extends RedisOptions { }

export interface CacheOptionsFactory {
  createModuleOptions: () => CacheModuleOptions | Promise<CacheModuleOptions>
}

export interface CacheModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<CacheModuleOptions>
  useClass?: Type<CacheModuleOptions>
  useFactory?: (...args: Array<any>) => CacheModuleOptions | Promise<CacheModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
