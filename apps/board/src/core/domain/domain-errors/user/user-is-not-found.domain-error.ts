import { DomainError } from 'libs/domain-error';

export class UserIsNotFoundDomainError extends DomainError {
  constructor() {
    super(`User with id is not found`);
  }
}
