import type { TodoRepository } from '../../domain';
import type { TodoSchema } from '@adapters/database-adapter';

import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { knex } from 'knex';
import { randomUUID } from 'node:crypto';
import { TodoIdVO } from '../../domain';
import { TodoTitleVO } from '../../domain';
import { TodoDescriptionVO } from '../../domain';
import { UserIdVO } from '../../domain';
import { Todo } from '../../domain';
import { TodoCreatedEvent } from '../../domain';
import { TodoUpdatedEvent } from '../../domain';
import { TodoDeletedEvent } from '../../domain';
import { TodoCompletedEvent } from '../../domain';
import { TodoNotCompletedEvent } from '../../domain';

@Injectable()
export class TodoRepositoryImpl implements TodoRepository {
  private readonly knex = knex({ client: 'pg' });
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public nextId(): TodoIdVO {
    return new TodoIdVO(randomUUID());
  }

  public async findById(todoId: TodoIdVO): Promise<Todo | null> {
    const SQL = this.knex<TodoSchema>('todos')
      .select(
        'id',
        'title',
        'description',
        'is_completed',
        'is_deleted',
        'deadline',
        'owner_id',
      )
      .where('id', todoId.value)
      .andWhere('is_deleted', false)
      .toSQL()
      .toNative();
    const dbTodo = await this.txHost.tx.oneOrNone<TodoSchema>(
      SQL.sql,
      SQL.bindings,
    );
    if (!dbTodo) return null;
    return new Todo(
      new TodoIdVO(dbTodo.id),
      new TodoTitleVO(dbTodo.title),
      dbTodo.description ? new TodoDescriptionVO(dbTodo.description) : null,
      dbTodo.is_completed,
      dbTodo.is_deleted,
      dbTodo.deadline ? dbTodo.deadline : null,
      new UserIdVO(dbTodo.owner_id),
    );
  }

  public async save(todo: Todo): Promise<void> {
    const events = todo.getUncommittedEvents();
    if (events.some((event) => event instanceof TodoCreatedEvent)) {
      return await this.saveCreatedEvent(todo);
    } else if (events.some((event) => event instanceof TodoUpdatedEvent)) {
      const todoUpdatedEvent = events.find(
        (event) => event instanceof TodoUpdatedEvent,
      ) as TodoUpdatedEvent;
      return await this.saveUpdatedEvent(todo, todoUpdatedEvent.updatedFields);
    } else if (events.some((event) => event instanceof TodoDeletedEvent)) {
      return await this.saveDeletedEvent(todo);
    } else if (events.some((event) => event instanceof TodoCompletedEvent)) {
      return await this.saveCompletedEvent(todo);
    } else if (events.some((event) => event instanceof TodoNotCompletedEvent)) {
      return await this.saveNotCompletedEvent(todo);
    }
    throw new Error('Unknown event');
  }

  private async saveCreatedEvent(todo: Todo): Promise<void> {
    const SQL = this.knex<TodoSchema>('todos')
      .insert({
        id: todo.id.value,
        title: todo.title.value,
        description: todo.description ? todo.description.value : undefined,
        is_completed: todo.isCompleted,
        is_deleted: todo.isDeleted,
        deadline: todo.deadline ? todo.deadline : undefined,
        owner_id: todo.ownerId.value,
      })
      .toSQL()
      .toNative();
    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveUpdatedEvent(
    todo: Todo,
    updatedFields: Array<string>,
  ): Promise<void> {
    const updateData: Partial<TodoSchema> = {};

    if (updatedFields.includes('title')) {
      updateData.title = todo.title.value;
    }
    if (updatedFields.includes('description')) {
      updateData.description = todo.description
        ? todo.description.value
        : undefined;
    }
    if (updatedFields.includes('deadline')) {
      updateData.deadline = todo.deadline ? todo.deadline : undefined;
    }

    if (Object.keys(updateData).length === 0) return;

    const SQL = this.knex<TodoSchema>('todos')
      .update(updateData)
      .where('id', todo.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveDeletedEvent(todo: Todo): Promise<void> {
    const SQL = this.knex<TodoSchema>('todos')
      .update({ is_deleted: true })
      .where('id', todo.id.value)
      .toSQL()
      .toNative();
    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveCompletedEvent(todo: Todo): Promise<void> {
    const SQL = this.knex<TodoSchema>('todos')
      .update({ is_completed: true })
      .where('id', todo.id.value)
      .toSQL()
      .toNative();
    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveNotCompletedEvent(todo: Todo): Promise<void> {
    const SQL = this.knex<TodoSchema>('todos')
      .update({ is_completed: false })
      .where('id', todo.id.value)
      .toSQL()
      .toNative();
    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }
}
