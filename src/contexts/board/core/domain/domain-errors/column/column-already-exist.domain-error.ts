import { DomainError } from '@libs/domain-error';

export class ColumnAlreadyExistDomainError extends DomainError {
  constructor(columnId: string) {
    super(`Column with id ${columnId} already exists`);
  }
}
