import type { CanActivate } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsConfig } from '@adapters/config-adapter';

@Injectable()
export class TokenGuard implements CanActivate {
  private readonly metricsConfig: MetricsConfig;

  constructor(private readonly configService: ConfigService) {
    this.metricsConfig = this.configService.get<MetricsConfig>('metrics')!;
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.metricsConfig.token) return true;

    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token || token !== `Bearer ${this.metricsConfig.token}`) {
      throw new NotFoundException();
    }

    return true;
  }
}
