import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import {
  TodoDescriptionVO,
  TodoIdVO,
  TodoNotFoundDomainError,
  TodoTitleVO,
} from '@contexts/todo/domain';

export class UpdateTodoCommand extends Command<
  Result<null, TodoNotFoundDomainError>
> {
  constructor(
    public readonly todoId: TodoIdVO,
    public readonly userId: string,
    public readonly title: TodoTitleVO,
    public readonly isCompleted: boolean,
    public readonly description: TodoDescriptionVO,
    public readonly deadline: Date | null,
  ) {
    super();
  }
}
