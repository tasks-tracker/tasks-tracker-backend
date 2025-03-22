import type { UserRepository } from '../../domain';
import type { Result } from 'neverthrow';

import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { Redis } from 'ioredis';
import { randomUUID } from 'node:crypto';

import { ok } from 'neverthrow';
import { err } from 'neverthrow';
import { UserIdVO } from '../../domain';
import { LoginVO } from '../../domain';
import { PasswordHashVO } from '../../domain';
import { SessionIdVO } from '../../domain';
import { User } from '../../domain';
import { UserLoginAlreadyUsedDomainError } from '../../domain';
import { UserRegisteredByLoginEvent } from '../../domain';
import { SessionAddedEvent } from '../../domain';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
    private readonly redis: Redis,
  ) { }

  public nextId(): UserIdVO {
    return new UserIdVO(randomUUID());
  }

  public async save(
    user: User,
  ): Promise<Result<null, UserLoginAlreadyUsedDomainError>> {
    const events = user.getUncommittedEvents();
    if (events.some((event) => event instanceof UserRegisteredByLoginEvent)) {
      return await this.saveRegisteredByLoginEvent(user);
    } else if (events.some((event) => event instanceof SessionAddedEvent)) {
      const sessionAddedEvent = events.find((event) => event instanceof SessionAddedEvent) as SessionAddedEvent;
      return await this.saveSessionAddedEvent(user, sessionAddedEvent.sessionId);
    }
    throw new Error('Unknown event');
  }

  public async getUserByLogin(login: LoginVO): Promise<User | null> {
    const dbUser = await this.txHost.tx.oneOrNone(
      `SELECT id, login, password_hash, registered_at
       FROM users
       WHERE login = $1`,
      [login.value],
    )
    if (!dbUser) return null;
    return new User(
      new UserIdVO(dbUser.id),
      new LoginVO(dbUser.login),
      new PasswordHashVO(dbUser.password_hash),
      dbUser.registered_at,
      [], // Load sessions from redis is too much for each case, maybe add options.loadSessions
    );
  }

  private async saveRegisteredByLoginEvent(
    user: User,
  ): Promise<
    Result<
      null,
      UserLoginAlreadyUsedDomainError | UserLoginAlreadyUsedDomainError
    >
  > {
    try {
      await this.txHost.tx.none(
        `INSERT INTO users
         (id, login, password_hash, registered_at)
       VALUES
         ($1, $2, $3, $4)`,
        [
          user.id.value,
          user.login.value,
          user.passwordHash.value,
          user.registeredAt,
        ],
      );
      return ok(null);
    } catch (error) {
      if (error.constraint === 'unique_user_login')
        return err(new UserLoginAlreadyUsedDomainError());
      else throw error;
    }
  }

  private async saveSessionAddedEvent(
    user: User,
    sessionId: SessionIdVO
  ): Promise<Result<null, never>> {
    const session = user.sessions.find((session) => session.id.equals(sessionId))!;
    const sessionKey = `session:${session.id.value}`;
    const userSessionsKey = `user_sessions:${user.id.value}`;
    const tokenKey = `token_to_session:${session.token.value}`;
    const ttl = Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    await this.redis.set(sessionKey, JSON.stringify({
      id: session.id.value,
      userId: user.id.value,
      token: session.token.value,
      expiresAt: session.expiresAt,
    }), "EX", ttl);

    await this.redis.sadd(userSessionsKey, session.id.value);
    await this.redis.set(tokenKey, session.id.value, "EX", ttl);

    return ok(null);
  }
}
