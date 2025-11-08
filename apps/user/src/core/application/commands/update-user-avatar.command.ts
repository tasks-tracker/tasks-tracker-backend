import { Command } from '@nestjs/cqrs';
import { UserIdVO } from 'apps/auth/src';
import { DomainError } from 'libs/domain-error';
import { Result } from 'neverthrow';
import { AvatarUrlVO } from '../../domain';

export class UpdateUserAvatarCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly userId: UserIdVO,
    public readonly avatarUrl: AvatarUrlVO,
  ) {
    super();
  }
}
