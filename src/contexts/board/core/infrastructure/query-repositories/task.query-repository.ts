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
  UserIdVO,
} from '../../domain';
import { TaskSchema } from '@adapters/database-adapter';
import { TaskInterface } from '../../domain/interfaces';

@Injectable()
export class TaskQueryRepositoryImpl implements TaskQueryRepository {
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async findTasksByUserId(
    userId: UserIdVO,
  ): Promise<Result<TaskInterface[], TaskNotFoundDomainError>> {
    const SQL = this.knex<TaskSchema>('tasks')
      .select('*')
      .where('owner_id', userId.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.manyOrNone<TaskSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) {
      return err(new TaskNotFoundDomainError(userId.value));
    }

    return ok(
      result.map((task) => {
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          order: task.order_number,
          columnId: task.column_id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          ownerId: task.owner_id,
        };
      }),
    );
  }

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
        new UserIdVO(result.owner_id),
        result.is_deleted,
      ),
    );
  }
}
