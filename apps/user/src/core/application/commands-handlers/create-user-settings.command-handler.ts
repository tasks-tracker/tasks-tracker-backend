import { CreateUserSettingsCommand } from '../commands';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSettings, UserSettingsRepository } from '../../domain';
import { err, ok, Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

@CommandHandler(CreateUserSettingsCommand)
export class CreateUserSettingsCommandHandler
  implements ICommandHandler<CreateUserSettingsCommand>
{
  constructor(public readonly userRepository: UserSettingsRepository) {}

  async execute(
    command: CreateUserSettingsCommand,
  ): Promise<Result<void, DomainError>> {
    try {
      const userSettings = UserSettings.create(command.userId);

      await this.userRepository.save(userSettings);
      userSettings.commit();
      return ok();
    } catch (error) {
      console.log(error);
      return err(new DomainError('ERROR_CREATING_USER_SETTINGS'));
    }
  }
}
