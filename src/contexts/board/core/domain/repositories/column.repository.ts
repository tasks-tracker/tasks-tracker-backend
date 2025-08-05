import { BoardIdVO, ColumnOwnerIdVO, ColumnTitleVO } from '../value-objects';
import { Column } from '../aggregates';
import { Result } from 'neverthrow';
import { ColumnIdVO } from '../value-objects';
import { DomainError } from '@libs/domain-error';
import { ColumnNotFoundDomainError } from '../domain-errors';
import { UserIdVO } from '@contexts/auth';

export abstract class ColumnRepository {
  public abstract nextId(): BoardIdVO;

  public abstract save(column: Column): Promise<Result<null, DomainError>>;

  public abstract createColumn(
    column: Column,
  ): Promise<Result<null, DomainError>>;

  public abstract findById(
    id: ColumnIdVO,
  ): Promise<Result<Column, ColumnNotFoundDomainError>>;

  public abstract removeColumn(
    id: ColumnIdVO,
  ): Promise<Result<null, ColumnNotFoundDomainError>>;

  public abstract changeBoard(
    id: ColumnIdVO,
    boardId: BoardIdVO,
  ): Promise<Result<null, ColumnNotFoundDomainError>>;

  public abstract changeOwner(
    id: ColumnIdVO,
    ownerId: ColumnOwnerIdVO,
  ): Promise<Result<null, ColumnNotFoundDomainError>>;

  public abstract renameColumn(
    id: ColumnIdVO,
    newTitle: ColumnTitleVO,
    userId: UserIdVO,
  ): Promise<Result<null, ColumnNotFoundDomainError>>;
}
