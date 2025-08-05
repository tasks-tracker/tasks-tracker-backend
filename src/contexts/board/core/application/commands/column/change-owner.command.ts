import { Command } from '@nestjs/cqrs';
import { ColumnIdVO, ColumnOwnerIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';

export class ChangeColumnOwnerCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly columnId: ColumnIdVO,
    public readonly ownerId: ColumnOwnerIdVO,
  ) {
    super();
  }
}
