import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ResponseStatusesMiddleware implements NestMiddleware {
  constructor(@InjectMetric('http_response_statuses') private counter: Counter) { }

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      this.counter.inc({
        status_code: res.statusCode.toString(),
      });
    });

    next();
  }
}
