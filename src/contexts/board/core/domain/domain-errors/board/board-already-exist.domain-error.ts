import { DomainError } from '@libs/domain-error';

export class BoardAlreadyExistDomainError extends DomainError {
  constructor(boardId: string) {
    super(`Column with id ${boardId} already exists`);
  }
}
