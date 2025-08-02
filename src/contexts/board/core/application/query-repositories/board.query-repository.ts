import {
  BoardIdVO,
  BoardTitleVO,
  BoardUserIdVO,
} from '@contexts/board/core/domain/value-objects';
import { Board } from '@contexts/board/core/domain/aggregates';
import { BoardIsNotFoundDomainError } from '@contexts/board/core/domain/domain-errors';
import { DomainError } from '@libs/domain-error';
import { Result } from 'neverthrow';

export abstract class BoardQueryRepository {
  public abstract findById(
    id: string,
  ): Promise<Result<Board, BoardIsNotFoundDomainError>>;

  public abstract existsByTitle(
    title: BoardTitleVO,
  ): Promise<Result<boolean, BoardIsNotFoundDomainError>>;

  public abstract findBoardsByUserId(
    userId: BoardUserIdVO,
  ): Promise<Result<Board[], BoardIsNotFoundDomainError>>;

  public abstract getBoardInfoById(
    id: BoardIdVO,
  ): Promise<Result<Board, BoardIsNotFoundDomainError>>;

  public abstract existByUserId(
    userId: string,
  ): Promise<Result<boolean, DomainError>>;
}
