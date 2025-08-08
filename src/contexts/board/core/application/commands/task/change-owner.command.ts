import { Command } from '@nestjs/cqrs';
import { ColumnOwnerIdVO, TaskIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';

export class ChangeTaskOwnerCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly taskId: TaskIdVO,
    public readonly ownerId: ColumnOwnerIdVO,
  ) {
    super();
  }
}
