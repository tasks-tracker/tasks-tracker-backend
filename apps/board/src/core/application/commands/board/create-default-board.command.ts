import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';
import { UserIdVO } from '../../../domain';

export class CreateDefaultBoardCommand extends Command<
  Result<null, DomainError>
> {
  constructor(public readonly ownerId: UserIdVO) {
    super();
  }
}
