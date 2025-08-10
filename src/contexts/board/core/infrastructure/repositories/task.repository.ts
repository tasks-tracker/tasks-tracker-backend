import { Injectable } from '@nestjs/common';
import {
  Task,
  TaskChangeColumnEvent,
  TaskChangeDescriptionEvent,
  TaskChangeOrderEvent,
  TaskChangeOwnerEvent,
  TaskChangeTitleEvent,
  TaskCreatedEvent,
  TaskIdVO,
  TaskNotFoundDomainError,
  TaskRemovedEvent,
  TaskRenameEvent,
  TaskRepository,
} from '../../domain';
import { knex } from 'knex';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { TaskSchema } from '@adapters/database-adapter';
import { randomUUID } from 'crypto';
import { ok, Result } from 'neverthrow';
import { err } from 'neverthrow';
import {
  ColumnIdVO,
  TaskDescriptionVO,
  TaskOwnerIdVO,
} from '../../domain/value-objects';
import { TaskOrderVO } from '../../domain/value-objects';
import { TaskTitleVO } from '../../domain/value-objects';

@Injectable()
export class TaskRepositoryImpl implements TaskRepository {
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public nextId(): TaskIdVO {
    return new TaskIdVO(randomUUID());
  }

  public async findById(
    id: TaskIdVO,
  ): Promise<Result<Task, TaskNotFoundDomainError>> {
    const SQL = this.knex<TaskSchema>('tasks')
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
        result.is_removed,
      ),
    );
  }

  public async save(task: Task): Promise<void> {
    const events = task.getUncommittedEvents();
    if (events.some((event) => event instanceof TaskChangeColumnEvent)) {
      return await this.saveChangeColumnEvent(task);
    } else if (
      events.some((event) => event instanceof TaskChangeDescriptionEvent)
    ) {
      return await this.saveChangeDescriptionEvent(task);
    } else if (events.some((event) => event instanceof TaskChangeOrderEvent)) {
      return await this.saveChangeOrderEvent(task);
    } else if (events.some((event) => event instanceof TaskChangeOwnerEvent)) {
      return await this.saveChangeAssignerEvent(task);
    } else if (events.some((event) => event instanceof TaskChangeTitleEvent)) {
      return await this.saveChangeTitleEvent(task);
    } else if (events.some((event) => event instanceof TaskCreatedEvent)) {
      return await this.saveCreatedEvent(task);
    } else if (events.some((event) => event instanceof TaskRemovedEvent)) {
      return await this.saveRemovedEvent(task);
    } else if (events.some((event) => event instanceof TaskRenameEvent)) {
      return await this.saveRenamedEvent(task);
    }
  }

  private async saveChangeColumnEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .update({
        column_id: task.columnId.value,
      })
      .where('id', task.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveChangeDescriptionEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .update({
        description: task.description.value,
      })
      .where('id', task.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveChangeOrderEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .update({
        order_number: task.order.value,
      })
      .where('id', task.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveChangeAssignerEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .update({
        owner_id: task.assignerId.value,
      })
      .where('id', task.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveChangeTitleEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .update({
        title: task.title.value,
      })
      .where('id', task.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveCreatedEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .insert({
        id: task.id.value,
        title: task.title.value,
        description: task.description.value,
        order_number: task.order.value,
        column_id: task.columnId.value,
        owner_id: task.assignerId.value,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        is_removed: task.isRemoved,
      })
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveRemovedEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .update({
        is_removed: true,
      })
      .where('id', task.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveRenamedEvent(task: Task) {
    const SQL = this.knex<TaskSchema>('tasks')
      .update({
        title: task.title.value,
      })
      .where('id', task.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }
}
