import { UpdateUserAvatarCommand } from '../commands';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSettingsRepository } from '../../domain';
import { err, ok, Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

@CommandHandler(UpdateUserAvatarCommand)
export class UpdateUserAvatarCommandHandler
  implements ICommandHandler<UpdateUserAvatarCommand>
{
  constructor(public readonly userRepository: UserSettingsRepository) {}

  async execute(
    command: UpdateUserAvatarCommand,
  ): Promise<Result<void, DomainError>> {
    const userResult = await this.userRepository.findById(command.userId);

    if (userResult.isErr()) {
      return err(userResult.error);
    }

    const user = userResult.value;

    user.updateAvatar(command.avatarUrl);

    await this.userRepository.save(user);

    user.commit();
    return ok();
  }
}
