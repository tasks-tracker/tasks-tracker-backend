import { Injectable } from '@nestjs/common';
import {
  Board,
  BoardCreatedEvent,
  BoardIdVO,
  BoardOwnerChangedEvent,
  BoardOwnerIdVO,
  BoardRenameEvent,
  BoardRepository,
  BoardTitleVO,
} from '../../domain';
import { knex } from 'knex';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { randomUUID } from 'crypto';
import { BoardSchema } from '@adapters/database-adapter';

@Injectable()
export class BoardRepositoryImpl implements BoardRepository {
  private readonly knex = knex({ client: 'pg' });

  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async save(board: Board): Promise<void> {
    const events = board.getUncommittedEvents();
    if (events.some((event) => event instanceof BoardCreatedEvent)) {
      return await this.saveCreatedEvent(board);
    } else if (events.some((event) => event instanceof BoardRenameEvent)) {
      return await this.saveRenamedEvent(board);
    } else if (
      events.some((event) => event instanceof BoardOwnerChangedEvent)
    ) {
      return await this.saveChangedOwnerEvent(board);
    }
  }

  public nextId(): BoardIdVO {
    return new BoardIdVO(randomUUID());
  }

  public async findById(boardId: BoardIdVO): Promise<Board | null> {
    const SQL = this.knex<BoardSchema>('boards')
      .select('id', 'title', 'owner_id', 'created_at', 'updated_at')
      .where('id', boardId.value)
      .toSQL()
      .toNative();

    const dbBoard = await this.txHost.tx.oneOrNone<BoardSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!dbBoard) return null;

    return Board.create(
      new BoardIdVO(dbBoard.id),
      new BoardTitleVO(dbBoard.title),
      new BoardOwnerIdVO(dbBoard.owner_id),
      dbBoard.created_at,
      dbBoard.updated_at,
    );
  }

  private async saveCreatedEvent(board: Board): Promise<void> {
    const SQL = this.knex<BoardSchema>('boards')
      .insert({
        id: board.id.value,
        title: board.title.value,
        owner_id: board.ownerId.value,
        created_at: board.createdAt,
        updated_at: board.updatedAt,
      })
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveRenamedEvent(board: Board): Promise<void> {
    const SQL = this.knex<BoardSchema>('boards')
      .update({
        title: board.title.value,
      })
      .where('id', board.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  private async saveChangedOwnerEvent(board: Board): Promise<void> {
    const SQL = this.knex<BoardSchema>('boards')
      .update({
        owner_id: board.ownerId.value,
      })
      .where('id', board.id.value)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }
}
