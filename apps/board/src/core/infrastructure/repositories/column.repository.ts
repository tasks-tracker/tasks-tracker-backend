import { Injectable } from '@nestjs/common';
import {
  BoardIdVO,
  Column,
  ColumnIdVO,
  ColumnNotFoundDomainError,
  ColumnOrderVO,
  UserIdVO,
  ColumnTitleVO,
  ColumnRepository,
  ColumnCreatedEvent,
  ColumnRemovedEvent,
  ColumnUpdatedEvent,
} from '../../domain';
import { knex } from 'knex';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { TransactionHost } from '@nestjs-cls/transactional';
import { err, ok, Result } from 'neverthrow';
import { ColumnSchema } from 'adapters/database-adapter';
import { randomUUID } from 'crypto';

@Injectable()
export class ColumnRepositoryImpl implements ColumnRepository {
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async save(column: Column): Promise<void> {
    const events = column.getUncommittedEvents();
    if (events.some((event) => event instanceof ColumnCreatedEvent)) {
      return await this.saveCreatedEvent(column);
    } else if (events.some((event) => event instanceof ColumnRemovedEvent)) {
      return await this.saveRemovedEvent(column);
    } else if (events.some((event) => event instanceof ColumnUpdatedEvent)) {
      return await this.saveUpdatedEvent(column);
    } else {
      throw new Error('Unknown event');
    }
  }

  private async saveCreatedEvent(column: Column): Promise<void> {
    const SQL = this.knex<ColumnSchema>('columns')
      .insert({
        id: column.id.value,
        title: column.title.value,
        order_number: column.order.value,
        board_id: column.boardId.value,
        owner_id: column.creatorId.value,
        created_at: column.craetedAt,
        updated_at: column.updatedAt,
        is_deleted: column.isDeleted,
      })
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveRemovedEvent(column: Column): Promise<void> {
    const SQL = this.knex<ColumnSchema>('columns')
      .update({
        is_deleted: true,
      })
      .where('id', column.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  public async saveUpdatedEvent(column: Column) {
    const SQL = this.knex<ColumnSchema>('columns')
      .update({
        board_id: column.boardId.value,
        created_at: column.craetedAt,
        id: column.id.value,
        is_deleted: column.isDeleted,
        order_number: column.order.value,
        owner_id: column.creatorId.value,
        title: column.title.value,
        updated_at: column.updatedAt,
      })
      .where('id', column.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  public nextId(): ColumnIdVO {
    return new ColumnIdVO(randomUUID());
  }

  public async findById(
    id: ColumnIdVO,
  ): Promise<Result<Column, ColumnNotFoundDomainError>> {
    const SQL = this.knex<ColumnSchema>('columns')
      .where('id', id.value)
      .where('is_deleted', false)
      .first()
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.oneOrNone<ColumnSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) {
      return err(new ColumnNotFoundDomainError(id.value));
    }

    return ok(
      new Column(
        new ColumnIdVO(result.id),
        new ColumnTitleVO(result.title),
        new ColumnOrderVO(result.order_number),
        new BoardIdVO(result.board_id),
        new UserIdVO(result.owner_id),
        new Date(result.created_at),
        new Date(result.updated_at),
        result.is_deleted,
      ),
    );
  }
}
