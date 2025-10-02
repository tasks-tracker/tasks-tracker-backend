import { Command } from '@nestjs/cqrs';
import { ColumnIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';
import { UserIdVO } from 'apps/auth/src';

export class ChangeColumnOwnerCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly columnId: ColumnIdVO,
    public readonly ownerId: UserIdVO,
  ) {
    super();
  }
}
