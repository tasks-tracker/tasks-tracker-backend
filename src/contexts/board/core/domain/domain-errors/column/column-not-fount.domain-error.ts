import { DomainError } from '@libs/domain-error';

export class ColumnNotFoundDomainError extends DomainError {
  constructor(columnId: string) {
    super(`Column with id ${columnId} is not found`);
  }
}
