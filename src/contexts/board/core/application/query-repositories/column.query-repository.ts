import { Result } from 'neverthrow';
import {
  BoardIsNotFoundDomainError,
  Column,
  ColumnNotFoundDomainError,
  UserIdVO,
  UserIsNotFoundDomainError,
} from '../../domain';
import { BoardIdVO, ColumnIdVO, ColumnTitleVO } from '../../domain';
import { ColumnInterface } from '../../domain';

export abstract class ColumnQueryRepository {
  public abstract findById(
    id: ColumnIdVO,
  ): Promise<Result<Column, ColumnNotFoundDomainError>>;

  public abstract existsByTitle(
    title: ColumnTitleVO,
  ): Promise<Result<boolean, ColumnNotFoundDomainError>>;

  public abstract getUserColumnIds(
    userId: UserIdVO,
  ): Promise<Result<ColumnIdVO[], UserIsNotFoundDomainError>>;

  public abstract findColumnsByBoardId(
    boardId: BoardIdVO,
  ): Promise<Result<Column[], BoardIsNotFoundDomainError>>;

  public abstract findColumnsByUserId(
    userId: UserIdVO,
  ): Promise<Result<ColumnInterface[], UserIsNotFoundDomainError>>;
}
