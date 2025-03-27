import type { Result } from 'neverthrow';
import { LoginVO } from '../../domain';
import { InvalidPasswordDomainError } from '../../domain';
import { UserWithLoginNotExistDomainError } from '../../domain';
import { PasswordVO } from '../../domain';
import { SessionTokenVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class LoginUserCommand extends Command<
  Result<
    SessionTokenVO,
    InvalidPasswordDomainError | UserWithLoginNotExistDomainError
  >
> {
  constructor(
    public readonly login: LoginVO,
    public readonly password: PasswordVO,
  ) {
    super();
  }
}
