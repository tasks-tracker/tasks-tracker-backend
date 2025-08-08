import { Command } from '@nestjs/cqrs';
import { TaskIdVO, TaskOrderVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';

export class ChangeTaskOrderCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly taskId: TaskIdVO,
    public readonly order: TaskOrderVO,
  ) {
    super();
  }
}
