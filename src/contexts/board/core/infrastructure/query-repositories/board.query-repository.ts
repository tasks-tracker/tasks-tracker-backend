import { Injectable } from '@nestjs/common';
import { BoardQueryRepository } from '../../application';
import { knex } from 'knex';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { DomainError } from '@libs/domain-error';
import { ok, err, Result } from 'neverthrow';
import { BoardSchema } from '@adapters/database-adapter';
import {
  BoardTitleVO,
  BoardIsNotFoundDomainError,
  Board,
  UserIdVO,
  BoardIdVO,
  FullBoardResponse,
} from '../../domain';
import { BoardCacheService } from '../services';

@Injectable()
export class BoardQueryRepositoryImpl implements BoardQueryRepository {
  private readonly knex = knex({ client: 'pg' });
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
    private readonly boardCacheService: BoardCacheService,
  ) {}

  public async existByUserId(
    userId: string,
  ): Promise<Result<boolean, DomainError>> {
    const SQL = this.knex<BoardSchema>('boards')
      .select('id')
      .where('owner_id', userId)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.oneOrNone<BoardSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return ok(false);
    return ok(true);
  }

  public async existsByTitle(
    title: BoardTitleVO,
  ): Promise<Result<boolean, BoardIsNotFoundDomainError>> {
    const SQL = this.knex<BoardSchema>('boards')
      .select('id')
      .where('title', title.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.oneOrNone<BoardSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return ok(false);
    return ok(true);
  }

  public async findBoardsByUserId(
    userId: UserIdVO,
  ): Promise<
    Result<
      Pick<FullBoardResponse, 'board'>['board'][],
      BoardIsNotFoundDomainError
    >
  > {
    const SQL = this.knex<BoardSchema>('boards')
      .select('id', 'title', 'owner_id', 'created_at', 'updated_at')
      .where('owner_id', userId.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.manyOrNone<BoardSchema>(
      SQL.sql,
      SQL.bindings,
    );

    const cachedBoards = await this.boardCacheService.getBoardsByUserId(
      new UserIdVO(userId.value),
    );

    if (cachedBoards && cachedBoards.length > 0) {
      return ok(cachedBoards.map((board) => board.board));
    }

    if (!result) return err(new BoardIsNotFoundDomainError(userId.value));

    return ok(
      result.map((board) => {
        return {
          id: board.id,
          title: board.title,
          owner: board.owner_id,
          ownerId: board.owner_id,
          createdAt: board.created_at.toISOString(),
          updatedAt: board.updated_at.toISOString(),
          userId: board.owner_id,
        };
      }),
    );
  }

  public async findById(
    id: BoardIdVO,
  ): Promise<Result<Board, BoardIsNotFoundDomainError>> {
    const SQL = this.knex<BoardSchema>('boards')
      .select('id', 'title', 'owner_id', 'created_at', 'updated_at')
      .where('id', id.value)
      .toSQL()
      .toNative();

    const result = await this.txHost.tx.oneOrNone<BoardSchema>(
      SQL.sql,
      SQL.bindings,
    );

    if (!result) return err(new BoardIsNotFoundDomainError(id.value));

    return ok(
      new Board(
        new BoardIdVO(result.id),
        new BoardTitleVO(result.title),
        new UserIdVO(result.owner_id),
        result.created_at,
        result.updated_at,
        false,
      ),
    );
  }
}
