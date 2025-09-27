import {
  BoardIdVO,
  BoardTitleVO,
  FullBoardResponse,
  UserIdVO,
} from '../../domain';
import { Board } from '../../domain';
import { BoardIsNotFoundDomainError } from '../../domain';
import { DomainError } from 'libs/domain-error';
import { Result } from 'neverthrow';

export abstract class BoardQueryRepository {
  public abstract findById(
    id: BoardIdVO,
  ): Promise<Result<Board, BoardIsNotFoundDomainError>>;

  public abstract existsByTitle(
    title: BoardTitleVO,
  ): Promise<Result<boolean, BoardIsNotFoundDomainError>>;

  public abstract findBoardsByUserId(
    userId: UserIdVO,
  ): Promise<
    Result<
      Pick<FullBoardResponse, 'board'>['board'][],
      BoardIsNotFoundDomainError
    >
  >;

  public abstract existByUserId(
    userId: string,
  ): Promise<Result<boolean, DomainError>>;
}
