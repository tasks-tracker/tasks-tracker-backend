import { Command } from '@nestjs/cqrs';
import { ColumnIdVO, TaskIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export class ChangeTaskColumnCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly taskId: TaskIdVO,
    public readonly columnId: ColumnIdVO,
  ) {
    super();
  }
}
