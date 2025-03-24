import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestPerTimeMiddleware implements NestMiddleware {
  constructor(@InjectMetric('http_requests_total') private counter: Counter) { }

  use(req: Request, res: Response, next: NextFunction) {
    if (!(req.method === 'GET' && req.path === '/metrics')) {
      console.log({ method: req.method, path: req.path });
      this.counter.inc();
    }
    next();
  }
}
