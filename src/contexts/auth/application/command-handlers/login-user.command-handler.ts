import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from '../commands';
import { Session } from '../../domain';
import { CryptoPort } from '../../domain';
import { UserRepository } from '../../domain';
import { SessionRepository } from '../../domain';
import { UserWithLoginNotExistDomainError } from '../../domain';
import { InvalidPasswordDomainError } from '../../domain';
import { SESSION_EXPIRATION_TIME } from '../../domain';
import { ok } from 'neverthrow';
import { err } from 'neverthrow';

@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler
  implements ICommandHandler<LoginUserCommand>
{
  constructor(
    private readonly cryptoPort: CryptoPort,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}
  async execute(command: LoginUserCommand) {
    const user = await this.userRepository.getUserByLogin(command.login);
    if (!user) return err(new UserWithLoginNotExistDomainError());
    const isPasswordValid = await this.cryptoPort.comparePassword(
      command.password,
      user.passwordHash,
    );
    if (!isPasswordValid) return err(new InvalidPasswordDomainError());
    const sessionId = this.sessionRepository.nextId();
    const sessionToken = await this.cryptoPort.generateSessionToken();
    const currentDate = new Date();
    const sessionExpirationDate = new Date(
      currentDate.getTime() + SESSION_EXPIRATION_TIME,
    );
    const session = new Session(sessionId, sessionToken, sessionExpirationDate);
    user.addSession(session);
    await this.userRepository.save(user);
    user.commit();
    return ok(sessionToken);
  }
}
