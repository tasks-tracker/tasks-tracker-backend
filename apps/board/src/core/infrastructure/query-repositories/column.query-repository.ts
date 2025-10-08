import { Injectable } from '@nestjs/common';
import { ColumnQueryRepository } from '../../application/query-repositories';
import { knex } from 'knex';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { err, ok, Result } from 'neverthrow';
import {
  ColumnTitleVO,
  ColumnNotFoundDomainError,
  BoardIdVO,
  BoardIsNotFoundDomainError,
  Column,
  UserIdVO,
  UserIsNotFoundDomainError,
  ColumnIdVO,
  ColumnOrderVO,
} from '../../domain';
import { ColumnSchema } from 'adapters/database-adapter';
import { ColumnInterface } from '../../domain/interfaces';

@Injectable()
export class ColumnQueryRepositoryImpl implements ColumnQueryRepository {
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async findById(
    id: ColumnIdVO,
  ): Promise<Result<Column, ColumnNotFoundDomainError>> {
    const SQL = this.knex<ColumnSchema>('columns')
      .select('*')
      .where('id', id.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.oneOrNone<ColumnSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return err(new ColumnNotFoundDomainError(id.value));
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

  public async existsByTitle(
    title: ColumnTitleVO,
  ): Promise<Result<boolean, ColumnNotFoundDomainError>> {
    const SQL = this.knex<ColumnSchema>('columns')
      .select('id')
      .where('title', title.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.oneOrNone<ColumnSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return ok(false);
    return ok(true);
  }

  public async findColumnsByBoardId(
    boardId: BoardIdVO,
  ): Promise<Result<Column[], BoardIsNotFoundDomainError>> {
    const SQL = this.knex<ColumnSchema>('columns')
      .select('*')
      .where('board_id', boardId.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.manyOrNone<ColumnSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return err(new BoardIsNotFoundDomainError(boardId.value));
    return ok(
      result.map(
        (r) =>
          new Column(
            new ColumnIdVO(r.id),
            new ColumnTitleVO(r.title),
            new ColumnOrderVO(r.order_number),
            new BoardIdVO(r.board_id),
            new UserIdVO(r.owner_id),
            new Date(r.created_at),
            new Date(r.updated_at),
            r.is_deleted,
          ),
      ),
    );
  }

  public async findColumnsByUserId(
    userId: UserIdVO,
  ): Promise<Result<ColumnInterface[], UserIsNotFoundDomainError>> {
    const SQL = this.knex<ColumnSchema>('columns')
      .select('*')
      .where('owner_id', userId.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.manyOrNone<ColumnSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return err(new UserIsNotFoundDomainError());
    return ok(
      result.map((r) => ({
        id: r.id,
        title: r.title,
        order: r.order_number,
        boardId: r.board_id,
        ownerId: r.owner_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        isDeleted: r.is_deleted,
        creatorId: r.owner_id,
      })),
    );
  }

  public async getUserColumnIds(
    userId: UserIdVO,
  ): Promise<Result<ColumnIdVO[], UserIsNotFoundDomainError>> {
    const SQL = this.knex<ColumnSchema>('columns')
      .select('id')
      .where('owner_id', userId.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.manyOrNone<ColumnSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return err(new UserIsNotFoundDomainError());
    return ok(result.map((r) => new ColumnIdVO(r.id)));
  }
}
