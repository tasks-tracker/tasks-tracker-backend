import type { Result } from 'neverthrow';
import { LoginVO, UserLoginAlreadyUsedDomainError } from '../../domain';
import { PasswordVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class RegisterUserByLoginCommand extends Command<
  Result<null, UserLoginAlreadyUsedDomainError>
> {
  constructor(
    public readonly login: LoginVO,
    public readonly password: PasswordVO,
  ) {
    super();
  }
}
