import type { DynamicModule } from '@nestjs/common';
import type { Provider } from '@nestjs/common';
import type { LoggerOptions } from '../core';
import type { LoggerModuleAsyncOptions } from './logger.module.interface';
import type { LoggerModuleOptions } from './logger.module.interface';
import type { LoggerOptionsFactory } from './logger.module.interface';

import { Module } from '@nestjs/common';
import { Scope } from '@nestjs/common';
import { Logger } from '../core';
import { LOGGER_MODULE_OPTIONS } from './logger.module.tokens';

@Module({})
export class LoggerModule {
  private static defaultLoggerOptionsOutsideDI: LoggerOptions = {};

  constructor() {}

  static setDefaultOptionsForLogerOutsideDI(options: LoggerOptions): void {
    LoggerModule.defaultLoggerOptionsOutsideDI = options;
  }

  static createLoggerByOptions(options?: LoggerOptions): Logger {
    const logger = new Logger({
      ...LoggerModule.defaultLoggerOptionsOutsideDI,
      ...options,
    });
    return logger;
  }

  static register(loggerModuleOptions: LoggerModuleOptions): DynamicModule {
    return {
      global: loggerModuleOptions.global,
      module: LoggerModule,
      providers: [
        {
          provide: Logger,
          useFactory: (): Logger => {
            const logger = new Logger(loggerModuleOptions.options);
            return logger;
          },
          inject: [],
          scope: Scope.TRANSIENT,
        },
      ],
      exports: [Logger],
    };
  }

  static registerAsync(
    loggerModuleOptions: LoggerModuleAsyncOptions,
  ): DynamicModule {
    const logger = {
      provide: Logger,
      useFactory: (opts: LoggerModuleOptions['options']): Logger => {
        const logger = new Logger(opts);
        return logger;
      },
      inject: [LOGGER_MODULE_OPTIONS],
      scope: Scope.TRANSIENT,
    };

    return {
      global: loggerModuleOptions.global,
      module: LoggerModule,
      imports: loggerModuleOptions.imports || [],
      providers: [...this.createAsyncProviders(loggerModuleOptions), logger],
      exports: [Logger],
    };
  }

  private static createAsyncProviders(
    options: LoggerModuleAsyncOptions,
  ): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: LoggerModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: LOGGER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: LOGGER_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: LoggerOptionsFactory,
      ): Promise<LoggerModuleOptions> | LoggerModuleOptions =>
        optionsFactory.createLoggerOptions(),
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
