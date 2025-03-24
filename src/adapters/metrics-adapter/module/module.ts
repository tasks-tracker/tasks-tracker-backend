import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { Global } from '@nestjs/common';
import { RequestPerTimeMiddleware } from '../middlewares';
import { ResponseStatusesMiddleware } from '../middlewares';
import { MetricsController } from '../controllers';
import { httpAuthMeStatusesProvider } from '../providers';
import { httpAuthLogoutStatusesProvider } from '../providers';
import { httpAuthRegisterByLoginStatusesProvider } from '../providers';
import { httpAuthLoginStatusesProvider } from '../providers/http-auth-login-statuses.provider';

@Global()
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
    httpAuthMeStatusesProvider,
    httpAuthLogoutStatusesProvider,
    httpAuthRegisterByLoginStatusesProvider,
    httpAuthLoginStatusesProvider,
  ],
  exports: [
    PrometheusModule,
    httpAuthMeStatusesProvider,
    httpAuthLogoutStatusesProvider,
    httpAuthRegisterByLoginStatusesProvider,
    httpAuthLoginStatusesProvider,
  ],
})
export class MetricsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestPerTimeMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(ResponseStatusesMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
