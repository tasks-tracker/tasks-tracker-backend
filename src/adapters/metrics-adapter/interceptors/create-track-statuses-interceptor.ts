import type { NestInterceptor } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Response } from 'express';

import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

export const createTrackStatusesInterceptor = (metric: string) => {
  @Injectable()
  class TrackStatusesInterceptor implements NestInterceptor {
    constructor(@InjectMetric(metric) public counter: Counter) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const response: Response = context.switchToHttp().getResponse();
      response.on('finish', () => {
        const statusCode = response.statusCode;
        this.counter.inc({
          status_code: statusCode.toString(),
        });
      });

      return next.handle();
    }
  }

  return TrackStatusesInterceptor;
};
