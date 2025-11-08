import { Injectable } from '@nestjs/common';
import { UserSettingsRepository } from '../../domain/repositories/user-settings.repository';
import { knex } from 'knex';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import {
  UserAvatarChangedEvent,
  UserIdVO,
  UserSettings,
  UserNotFoundDomainError,
  AvatarUrlVO,
} from '../../domain';
import { randomUUID } from 'crypto';
import { err, ok, Result } from 'neverthrow';

import { UserSettingsSchema } from 'adapters/database-adapter';

@Injectable()
export class UserSettingsRepostitoryImpl implements UserSettingsRepository {
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async save(userSettings: UserSettings): Promise<void> {
    const events = userSettings.getUncommittedEvents();

    if (events.some((event) => event instanceof UserAvatarChangedEvent)) {
      return await this.updateAvatarEvent(userSettings);
    } else {
      throw new Error('Unknown event');
    }
  }

  public async updateAvatarEvent(userSettings: UserSettings): Promise<void> {
    const SQL = this.knex<UserSettingsSchema>('user-settings')
      .update({ avatarUrl: userSettings.avatarUrl.value! })
      .where(userSettings.id)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  public async findById(
    userId: UserIdVO,
  ): Promise<Result<UserSettings, UserNotFoundDomainError>> {
    const SQL = this.knex<UserSettingsSchema>('users-settings')
      .select('*')
      .where('user_id', userId.value)
      .toSQL()
      .toNative();

    const dbUser = await this.txHost.tx.oneOrNone<UserSettingsSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!dbUser) return err(new UserNotFoundDomainError(userId.value));

    try {
      const userSettings = new UserSettings(
        new UserIdVO(dbUser.user_id),
        new AvatarUrlVO(dbUser.avatarUrl),
        dbUser.settings,
        new Date(dbUser.createdAt),
        new Date(dbUser.updatedAt),
      );

      return ok(userSettings);
    } catch {
      return err(new UserNotFoundDomainError(userId.value));
    }
  }

  public nextId(): UserIdVO {
    return new UserIdVO(randomUUID());
  }
}
