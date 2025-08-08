import { Command } from '@nestjs/cqrs';
import { TaskDescriptionVO, TaskIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';

export class ChangeTaskDescriptionCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly taskId: TaskIdVO,
    public readonly description: TaskDescriptionVO,
  ) {
    super();
  }
}
