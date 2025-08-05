import { Command } from '@nestjs/cqrs';
import { ColumnIdVO, ColumnTitleVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { UserIdVO } from '@contexts/auth';

export class RenameColumnCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly columnId: ColumnIdVO,
    public readonly newTitle: ColumnTitleVO,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
