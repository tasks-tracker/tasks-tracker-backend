import { DomainError } from 'libs/domain-error';

export class BoardIsNotFoundDomainError extends DomainError {
  constructor(boardId: string) {
    super(`Board with id ${boardId} is not found`);
  }
}
