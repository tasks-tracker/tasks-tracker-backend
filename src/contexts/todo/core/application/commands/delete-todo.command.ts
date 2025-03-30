import type { Result } from 'neverthrow';
import type { TodoIdVO } from '../../domain';
import type { DomainError } from '@libs/domain-error';
import type { UserIdVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class DeleteTodoCommand extends Command<
  Result<null, DomainError>
> {
  constructor(
    public readonly todoId: TodoIdVO,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
