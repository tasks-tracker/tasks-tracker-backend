import { Command } from '@nestjs/cqrs';
import { ColumnIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export class ChangeColumnOwnerCommand extends Command<
  Result<void, DomainError>
> {
  constructor(public readonly columnId: ColumnIdVO) {
    super();
  }
}
