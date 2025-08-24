import { DomainError } from '@libs/domain-error';

export class TaskNotFoundDomainError extends DomainError {
  constructor(taskId: string) {
    super(`Task with id ${taskId} is not found`);
  }
}
