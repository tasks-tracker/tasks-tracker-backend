import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { EventPublisher } from '@nestjs/cqrs';
import { RegisterUserByLoginCommand } from '../commands';
import { User } from '../../domain';
import { CryptoPort } from '../../domain';
import { UserRepository } from '../../domain';
import { ok } from 'neverthrow';
import { OutboxRepository } from '@adapters/database-adapter';

@CommandHandler(RegisterUserByLoginCommand)
export class RegisterUserByLoginCommandHandler
  implements ICommandHandler<RegisterUserByLoginCommand>
{
  constructor(
    private readonly cryptoPort: CryptoPort,
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly outboxRepository: OutboxRepository,
  ) {}
  async execute(command: RegisterUserByLoginCommand) {
    const passwordHash = await this.cryptoPort.hashPassword(command.password);
    const userId = this.userRepository.nextId();
    const currentDate = new Date();
    const user = User.registerByLogin(
      userId,
      command.login,
      passwordHash,
      currentDate,
    );
    this.eventPublisher.mergeObjectContext(user);
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isErr()) return saveResult;

    await this.outboxRepository.saveEvent({
      aggregate_id: user.id.value,
      aggregate_type: 'User',
      event_type: 'UserRegisteredByLogin',
      event_data: JSON.stringify({
        id: user.id.value,
        login: user.login.value,
        passwordHash: user.passwordHash.value,
        registeredAt: currentDate,
      }),
    });

    user.commit();
    return ok(null);
  }
}
