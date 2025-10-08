import { Command } from '@nestjs/cqrs';
import { TaskIdVO, UserIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export class ChangeTaskOwnerCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly taskId: TaskIdVO,
    public readonly ownerId: UserIdVO,
  ) {
    super();
  }
}
