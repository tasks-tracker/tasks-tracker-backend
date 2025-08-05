import { Result } from 'neverthrow';
import {
  BoardIsNotFoundDomainError,
  Column,
  ColumnNotFoundDomainError,
  ColumnOwnerIdVO,
  UserIsNotFoundDomainError,
} from '../../domain';
import { BoardIdVO, ColumnIdVO, ColumnTitleVO } from '../../domain';

export abstract class ColumnQueryRepository {
  public abstract findById(
    id: ColumnIdVO,
  ): Promise<Result<Column, ColumnNotFoundDomainError>>;

  public abstract existsByTitle(
    title: ColumnTitleVO,
  ): Promise<Result<boolean, ColumnNotFoundDomainError>>;

  public abstract getUserColumnIds(
    userId: ColumnOwnerIdVO,
  ): Promise<Result<ColumnIdVO[], UserIsNotFoundDomainError>>;

  public abstract findColumnsByBoardId(
    boardId: BoardIdVO,
  ): Promise<Result<Column[], BoardIsNotFoundDomainError>>;

  public abstract findColumnsByUserId(
    userId: ColumnOwnerIdVO,
  ): Promise<Result<Column[], UserIsNotFoundDomainError>>;
}
