import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { TodoIdVO, TodoNotFoundDomainError } from '@contexts/todo/domain';
import { UserIdVO } from '@contexts/todo/domain/value-objects/todo-owner-id.value-object';

export class DeleteTodoCommand extends Command<
  Result<null, TodoNotFoundDomainError>
> {
  constructor(
    public readonly todoId: TodoIdVO,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
