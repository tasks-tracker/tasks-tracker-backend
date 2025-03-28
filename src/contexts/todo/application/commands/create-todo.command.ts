import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import {
  InvalidTodoDescriptionDomainError,
  InvalidTodoTitleDomainError,
  TodoDescriptionVO,
  TodoIdVO,
  TodoTitleVO,
} from '@contexts/todo/domain';
import { UserIdVO } from '@contexts/todo/domain/value-objects/todo-owner-id.value-object';

export class CreateTodoCommand extends Command<
  Result<
    TodoIdVO,
    InvalidTodoDescriptionDomainError | InvalidTodoTitleDomainError
  >
> {
  constructor(
    public readonly title: TodoTitleVO,
    public readonly description: TodoDescriptionVO,
    public readonly deadline: Date | null,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
