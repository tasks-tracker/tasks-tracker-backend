import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { LogoutSessionCommand } from '../commands';
import { SessionRepository } from '../../domain';
import { ok } from 'neverthrow';

@CommandHandler(LogoutSessionCommand)
export class LogoutSessionCommandHandler
  implements ICommandHandler<LogoutSessionCommand>
{
  constructor(private readonly sessionRespository: SessionRepository) {}
  async execute(command: LogoutSessionCommand) {
    const result = await this.sessionRespository.deleteSession(
      command.sessionToken,
    );
    if (result.isErr()) return result;
    return ok(null);
  }
}
