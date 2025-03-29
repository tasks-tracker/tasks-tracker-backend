import type { Result } from 'neverthrow';
import type { TodoIdVO } from '../../domain';
import type { TodoNotFoundDomainError } from '../../domain';
import type { TodoNotOwnerExceptionDomainError } from '../../domain';
import type { TodoAlreadyDeletedDomainError } from '../../domain';
import type { UserIdVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class DeleteTodoCommand extends Command<
  Result<null, TodoNotFoundDomainError | TodoNotOwnerExceptionDomainError | TodoAlreadyDeletedDomainError>
> {
  constructor(
    public readonly todoId: TodoIdVO,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
