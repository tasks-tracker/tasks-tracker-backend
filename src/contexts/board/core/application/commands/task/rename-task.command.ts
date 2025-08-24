import { Command } from '@nestjs/cqrs';
import { TaskIdVO, TaskTitleVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';

export class RenameTaskCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly taskId: TaskIdVO,
    public readonly newTitle: TaskTitleVO,
  ) {
    super();
  }
}
