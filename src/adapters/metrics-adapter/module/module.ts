import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { RequestPerTimeMiddleware } from '../middlewares';
import { ResponseStatusesMiddleware } from '../middlewares';
import { MetricsController } from '../controllers';

@Module({
  imports: [PrometheusModule.register()],
  controllers: [MetricsController],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
    }),
    makeCounterProvider({
      name: 'http_response_statuses',
      help: 'Total number of HTTP requests, partitioned by status code',
      labelNames: ['status_code'],
    }),
  ],
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestPerTimeMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(ResponseStatusesMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
