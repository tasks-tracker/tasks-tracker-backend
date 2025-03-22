import type { UserRepository } from '../../domain';
import type { Result } from 'neverthrow';

import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { randomUUID } from 'node:crypto';

import { ok } from 'neverthrow';
import { err } from 'neverthrow';
import { UserIdVO } from '../../domain';
import { User } from '../../domain';
import { UserLoginAlreadyUsedDomainError } from '../../domain';
import { UserRegisteredByLoginEvent } from '../../domain';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
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
    }
    throw new Error('Unknown event');
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

}
