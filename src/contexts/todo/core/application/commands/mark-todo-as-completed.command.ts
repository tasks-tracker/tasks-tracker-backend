import type { Result } from 'neverthrow';
import type { TodoIdVO } from '../../domain';
import type { UserIdVO } from '../../domain';
import type { DomainError } from '@libs/domain-error';
import { Command } from '@nestjs/cqrs';

export class MarkTodoAsCompletedCommand extends Command<
  Result<null, DomainError>
> {
  constructor(
    public readonly userId: UserIdVO,
    public readonly todoId: TodoIdVO,
  ) {
    super();
  }
}
