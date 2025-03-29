import type { Result } from 'neverthrow';
import type { DomainError } from '@libs/domain-error';
import type { LoginVO } from '../../domain';
import type { PasswordVO } from '../../domain';
import type { SessionTokenVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class LoginUserCommand extends Command<
  Result<SessionTokenVO, DomainError>
> {
  constructor(
    public readonly login: LoginVO,
    public readonly password: PasswordVO,
  ) {
    super();
  }
}
