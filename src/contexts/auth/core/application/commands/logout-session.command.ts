import type { Result } from 'neverthrow';
import type { DomainError } from '@libs/domain-error';
import type { SessionTokenVO } from '../../domain';
import { Command } from '@nestjs/cqrs';

export class LogoutSessionCommand extends Command<Result<null, DomainError>> {
  constructor(public readonly sessionToken: SessionTokenVO) {
    super();
  }
}
