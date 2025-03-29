import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Header } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { TokenGuard } from '../guards/token.guard';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  constructor() {}

  @Get()
  @UseGuards(TokenGuard)
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
