import type { Result } from 'neverthrow';
import type { TodoDescriptionVO } from '../../domain';
import type { TodoIdVO } from '../../domain';
import type { TodoTitleVO } from '../../domain';
import type { TodoNotFoundDomainError } from '../../domain';
import type { UserIdVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class UpdateTodoCommand extends Command<
  Result<null, TodoNotFoundDomainError>
> {
  constructor(
    public readonly todoId: TodoIdVO,
    public readonly userId: UserIdVO,
    public readonly title: TodoTitleVO,
    public readonly description: TodoDescriptionVO,
    public readonly deadline: Date | null,
  ) {
    super();
  }
}
