import type { Result } from 'neverthrow';
import type { TodoDescriptionVO } from '../../domain';
import type { TodoIdVO } from '../../domain';
import type { TodoTitleVO } from '../../domain';
import type { UserIdVO } from '../../domain';
import type { DomainError } from '@libs/domain-error';

import { Command } from '@nestjs/cqrs';

export class CreateTodoCommand extends Command<Result<TodoIdVO, DomainError>> {
  constructor(
    public readonly title: TodoTitleVO,
    public readonly description: TodoDescriptionVO,
    public readonly deadline: Date | null,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
