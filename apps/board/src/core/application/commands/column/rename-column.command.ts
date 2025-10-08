import { Command } from '@nestjs/cqrs';
import { ColumnIdVO, ColumnTitleVO, UserIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export class RenameColumnCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly columnId: ColumnIdVO,
    public readonly newTitle: ColumnTitleVO,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
