import type { Result } from 'neverthrow';
import type { TodoDescriptionVO } from '../../domain';
import type { TodoIdVO } from '../../domain';
import type { TodoTitleVO } from '../../domain';
import type { DomainError } from '@libs/domain-error';
import type { UserIdVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class UpdateTodoCommand extends Command<
  Result<null, DomainError>
> {
  constructor(
    public readonly todoId: TodoIdVO,
    public readonly userId: UserIdVO,
    public readonly fields: {
      title?: TodoTitleVO,
      description?: TodoDescriptionVO | null,
      deadline?: Date | null,
    }
  ) {
    super();
  }
}
