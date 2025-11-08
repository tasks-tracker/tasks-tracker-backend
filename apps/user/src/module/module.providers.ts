import { UserSettingsRepository } from '../core/domain';
import { UserSettingsRepostitoryImpl } from '../core/infrastructure/repositories/user-settings.repository';
import { UpdateUserAvatarCommandHandler } from '../core/application/commands-handlers';

export const commandHandlersProviders = [UpdateUserAvatarCommandHandler];

export const repositoriesProviders = [
  { provide: UserSettingsRepository, useClass: UserSettingsRepostitoryImpl },
];
