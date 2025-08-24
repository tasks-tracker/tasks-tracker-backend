import { DomainError } from '@libs/domain-error';

export class TaskAlreadyExistDomainError extends DomainError {
  constructor(taskId: string) {
    super(`Task with id ${taskId} already exists`);
  }
}
