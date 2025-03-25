import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { Global } from '@nestjs/common';
import { RequestPerTimeMiddleware } from '../middlewares';
import { ResponseStatusesMiddleware } from '../middlewares';
import { MetricsController } from '../controllers';
import { httpRequestTotalProvider } from '../providers';
import { httpResponseStatusesProvider } from '../providers';
import { httpAuthMeStatusesProvider } from '../providers';
import { httpAuthLogoutStatusesProvider } from '../providers';
import { httpAuthRegisterByLoginStatusesProvider } from '../providers';
import { httpAuthLoginStatusesProvider } from '../providers';

@Global()
@Module({
  imports: [PrometheusModule.register()],
  controllers: [MetricsController],
  providers: [
    httpRequestTotalProvider,
    httpResponseStatusesProvider,
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
