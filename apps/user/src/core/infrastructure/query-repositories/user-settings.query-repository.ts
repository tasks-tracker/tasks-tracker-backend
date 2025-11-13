import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { Injectable } from '@nestjs/common';
import { UserSettingsQueryRepository } from '../../application';
import { TransactionHost } from '@nestjs-cls/transactional';
import { err, ok, Result } from 'neverthrow';
import {
  UserIdVO,
  UserSettings,
  UserNotFoundDomainError,
  AvatarUrlVO,
} from '../../domain';
import { knex } from 'knex';
import { UserSettingsSchema } from 'adapters/database-adapter';

@Injectable()
export class UserSettingsQueryRepositoryImpl
  implements UserSettingsQueryRepository
{
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async findById(
    id: UserIdVO,
  ): Promise<Result<UserSettings, UserNotFoundDomainError>> {
    const SQL = this.knex<UserSettingsSchema>('users-settings')
      .select('*')
      .where('user_id', id.value)
      .toSQL()
      .toNative();

    const dbUser = await this.txHost.tx.oneOrNone<UserSettingsSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!dbUser) {
      return err(new UserNotFoundDomainError(id.value));
    }

    try {
      const userSettings = new UserSettings(
        new UserIdVO(dbUser.id),
        new UserIdVO(dbUser.user_id),
        new AvatarUrlVO(dbUser.avatar_url),
        dbUser.settings,
        new Date(dbUser.created_at),
        new Date(dbUser.updated_at),
      );

      return ok(userSettings);
    } catch {
      return err(new UserNotFoundDomainError(id.value));
    }
  }
}
