import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { knex } from 'knex';
import { TaskQueryRepository } from '../../application';
import { err, ok, Result } from 'neverthrow';
import {
  TaskIdVO,
  Task,
  TaskNotFoundDomainError,
  TaskDescriptionVO,
  TaskOrderVO,
  TaskTitleVO,
  ColumnIdVO,
  TaskOwnerIdVO,
} from '../../domain';
import { TaskSchema } from '@adapters/database-adapter';

@Injectable()
export class TaskQueryRepositoryImpl implements TaskQueryRepository {
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async findById(
    id: TaskIdVO,
  ): Promise<Result<Task, TaskNotFoundDomainError>> {
    const SQL = this.knex<TaskSchema>('tasks')
      .select('*')
      .where('id', id.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.oneOrNone<TaskSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) {
      return err(new TaskNotFoundDomainError(id.value));
    }

    return ok(
      new Task(
        new TaskIdVO(result.id),
        new TaskTitleVO(result.title),
        new TaskDescriptionVO(result.description),
        new TaskOrderVO(result.order_number),
        new ColumnIdVO(result.column_id),
        new Date(result.created_at),
        new Date(result.updated_at),
        new TaskOwnerIdVO(result.owner_id),
        result.is_deleted,
      ),
    );
  }
}
