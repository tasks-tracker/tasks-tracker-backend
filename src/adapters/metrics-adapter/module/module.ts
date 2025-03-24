import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { RequestPerTimeMiddleware } from '../middlewares';
import { MetricsController } from '../controllers';

@Module({
  imports: [PrometheusModule.register()],
  controllers: [MetricsController],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
    }),
  ],
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestPerTimeMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
