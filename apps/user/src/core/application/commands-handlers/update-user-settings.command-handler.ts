import { UpdateUserSettingsCommand } from '../commands';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSettingsRepository } from '../../domain';
import { err, ok, Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

@CommandHandler(UpdateUserSettingsCommand)
export class UpdateUserSettingsCommandHandler
  implements ICommandHandler<UpdateUserSettingsCommand>
{
  constructor(public readonly userRepository: UserSettingsRepository) {}

  async execute(
    command: UpdateUserSettingsCommand,
  ): Promise<Result<void, DomainError>> {
    const userResult = await this.userRepository.findById(command.userId);

    if (userResult.isErr()) {
      return err(userResult.error);
    }

    const user = userResult.value;

    user.updateSettings(command.settings);

    await this.userRepository.save(user);

    user.commit();
    return ok();
  }
}
