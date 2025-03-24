import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Header } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  constructor() { }

  @Get()
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
