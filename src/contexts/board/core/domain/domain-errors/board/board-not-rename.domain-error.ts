import { DomainError } from '@libs/domain-error';

export class BoardNotRenameDomainError extends DomainError {
  constructor(boardId: string) {
    super(`Board with id ${boardId} is not rename`);
  }
}
