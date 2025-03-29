// import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
// import { PrometheusModule } from '@willsoto/nestjs-prometheus';
// import { Global } from '@nestjs/common';
// import { RequestPerTimeMiddleware } from '../middlewares';
// import { ResponseStatusesMiddleware } from '../middlewares';
// import { MetricsController } from '../controllers';
// import * as providers from '../providers';
//
// const allProviders = Object.values(providers);
//
// @Global()
// @Module({
//   imports: [PrometheusModule.register()],
//   controllers: [MetricsController],
//   providers: [...allProviders],
//   exports: [PrometheusModule, ...allProviders],
// })
// export class MetricsModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(RequestPerTimeMiddleware)
//       .forRoutes({ path: '*', method: RequestMethod.ALL });
//     consumer
//       .apply(ResponseStatusesMiddleware)
//       .forRoutes({ path: '*', method: RequestMethod.ALL });
//   }
// }
//

import type { DynamicModule } from '@nestjs/common';
import type { Provider } from '@nestjs/common';
import type { MiddlewareConsumer } from '@nestjs/common';

import { Module } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { MetricsController } from '../controllers';
import * as providers from '../providers';
import { RequestPerTimeMiddleware } from '../middlewares';
import { ResponseStatusesMiddleware } from '../middlewares';

import type { MetricsModuleOptions } from './module.interfaces';
import type { MetricsModuleAsyncOptions } from './module.interfaces';
import type { MetricsModuleSyncOptions } from './module.interfaces';
import type { MetricsOptionsFactory } from './module.interfaces';
import { METRICS_MODULE_OPTIONS } from './module.constants';

const allProviders = Object.values(providers);

@Module({})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestPerTimeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(ResponseStatusesMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }

  static register(options: MetricsModuleSyncOptions): DynamicModule {
    return {
      global: options.isGlobal,
      module: MetricsModule,
      controllers: [MetricsController],
      imports: [PrometheusModule.register()],
      providers: [
        {
          provide: METRICS_MODULE_OPTIONS,
          useValue: options.options,
        },
        ...allProviders,
      ],
      exports: [PrometheusModule, ...allProviders],
    };
  }

  static registerAsync(options: MetricsModuleAsyncOptions): DynamicModule {
    return {
      global: options.isGlobal,
      module: MetricsModule,
      controllers: [MetricsController],
      imports: [...(options.imports || []), PrometheusModule.register()],
      providers: [...this.createAsyncProviders(options), ...allProviders],
      exports: [PrometheusModule, ...allProviders],
    };
  }

  private static createAsyncProviders(
    options: MetricsModuleAsyncOptions,
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
    options: MetricsModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: METRICS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: METRICS_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: MetricsOptionsFactory,
      ): MetricsModuleOptions | Promise<MetricsModuleOptions> =>
        optionsFactory.createModuleOptions(),
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
