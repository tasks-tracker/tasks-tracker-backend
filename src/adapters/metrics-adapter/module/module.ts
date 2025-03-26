import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Global } from '@nestjs/common';
import { RequestPerTimeMiddleware } from '../middlewares';
import { ResponseStatusesMiddleware } from '../middlewares';
import { MetricsController } from '../controllers';
import * as providers from '../providers';

const allProviders = Object.values(providers);

@Global()
@Module({
  imports: [PrometheusModule.register()],
  controllers: [MetricsController],
  providers: [...allProviders],
  exports: [PrometheusModule, ...allProviders],
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestPerTimeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(ResponseStatusesMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
