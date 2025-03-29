import type { CanActivate } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { METRICS_MODULE_OPTIONS } from '../module';
import { MetricsModuleOptions } from '../module';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    @Inject(METRICS_MODULE_OPTIONS) private readonly options: MetricsModuleOptions,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    if (!this.options.authToken) return true;

    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    if (!token || token !== `Bearer ${this.options.authToken}`) {
      throw new NotFoundException();
    }

    return true;
  }
}
