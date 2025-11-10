import { Command } from '@nestjs/cqrs';
import { UserIdVO } from '../../domain';
import { DomainError } from 'libs/domain-error';
import { Result } from 'neverthrow';

export class CreateUserSettingsCommand extends Command<
  Result<void, DomainError>
> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
