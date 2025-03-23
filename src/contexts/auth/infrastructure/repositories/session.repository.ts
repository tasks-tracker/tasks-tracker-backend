import type { SessionRepository } from '../../domain';

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SessionIdVO } from '../../domain';

@Injectable()
export class SessionRepositoryImpl implements SessionRepository {
  constructor() {}

  public nextId(): SessionIdVO {
    return new SessionIdVO(randomUUID());
  }
}
