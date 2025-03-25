import type { NestInterceptor } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';

export const createTrackExecutionTimeInterceptor = (metric: string) => {
  @Injectable()
  class TrackExecutionTimeInterceptor implements NestInterceptor {
    constructor(@InjectMetric(metric) public histogram: Histogram) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const start = process.hrtime();
      const response = context.switchToHttp().getResponse();
      response.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationInSeconds = seconds + nanoseconds / 1e9;
        this.histogram.observe(durationInSeconds);
      })

      return next.handle()
    }
  }

  return TrackExecutionTimeInterceptor;
};
