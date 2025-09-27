import { BoardIdVO } from '../value-objects';
import { Column } from '../aggregates';
import { Result } from 'neverthrow';
import { ColumnIdVO } from '../value-objects';
import { ColumnNotFoundDomainError } from '../domain-errors';

export abstract class ColumnRepository {
  public abstract nextId(): BoardIdVO;

  public abstract save(column: Column): Promise<void>;

  public abstract findById(
    id: ColumnIdVO,
  ): Promise<Result<Column, ColumnNotFoundDomainError>>;
}
