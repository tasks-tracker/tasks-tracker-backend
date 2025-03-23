import type { SessionRepository } from '../../domain';
import type { Result } from 'neverthrow';

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { err } from 'neverthrow';
import { ok } from 'neverthrow';

import { SessionIdVO } from '../../domain';
import { SessionTokenVO } from '../../domain';
import { NotUsedSessionTokenDomainError } from '../../domain';
import Redis from 'ioredis';

@Injectable()
export class SessionRepositoryImpl implements SessionRepository {
  constructor(
    public readonly redis: Redis,
  ) { }

  public nextId(): SessionIdVO {
    return new SessionIdVO(randomUUID());
  }

  public async deleteSession(sessionToken: SessionTokenVO): Promise<Result<null, NotUsedSessionTokenDomainError>> {
    const sessionId = await this.redis.get(`token_to_session:${sessionToken.value}`);
    if (!sessionId) return err(new NotUsedSessionTokenDomainError());

    const sessionData = await this.redis.get(`session:${sessionId}`);
    if (!sessionData) return err(new NotUsedSessionTokenDomainError());

    const { userId } = JSON.parse(sessionData);

    await this.redis.multi()
      .del(`session:${sessionId}`)
      .del(`token_to_session:${sessionToken.value}`)
      .srem(`user_sessions:${userId}`, sessionId)
      .exec();
    return ok(null);
  }
}
