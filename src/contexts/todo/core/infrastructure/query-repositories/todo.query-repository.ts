import type { UserIdVO } from '../../domain';
import type { ToDoQuery } from '../../application';
import type { TodoSchema } from '@adapters/database-adapter';

import { Injectable } from '@nestjs/common';
import { knex } from 'knex';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { TodoQueryRepository } from '../../application';

@Injectable()
export class TodoQueryRepositoryImpl implements TodoQueryRepository {
  private readonly knex = knex({ client: 'pg' });
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async getPaginationTodosByUserId(
    userId: UserIdVO,
    limit: number,
    offset: number,
  ): Promise<Array<ToDoQuery>> {
    const SQL = this.knex<TodoSchema>('todos')
      .select(
        'id',
        'title',
        'description',
        this.knex.ref('is_completed').as('isCompleted'),
        this.knex.ref('is_deleted').as('isDeleted'),
        'deadline',
      )
      .where('owner_id', userId.value)
      .andWhere('is_deleted', false)
      .limit(limit)
      .offset(offset)
      .toSQL()
      .toNative();
    const dbTodos = await this.txHost.tx.manyOrNone<ToDoQuery>(
      SQL.sql,
      SQL.bindings,
    );
    if (!dbTodos) return [];
    return dbTodos;
  }
}
