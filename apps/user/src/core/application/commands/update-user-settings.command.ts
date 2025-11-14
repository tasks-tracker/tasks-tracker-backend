import { Command } from '@nestjs/cqrs';
import { UserIdVO } from 'apps/auth/src';
import { DomainError } from 'libs/domain-error';
import { Result } from 'neverthrow';
import { Settings } from '../../domain';

export class UpdateUserSettingsCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly userId: UserIdVO,
    public readonly settings: Partial<Settings>,
  ) {
    super();
  }
}
