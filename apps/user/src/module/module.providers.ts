import { UserSettingsRepository } from '../core/domain';
import { UserSettingsRepostitoryImpl } from '../core/infrastructure/repositories/user-settings.repository';
import {
  CreateUserSettingsCommandHandler,
  UpdateUserAvatarCommandHandler,
} from '../core/application/commands-handlers';
import { UserSettingsConsumer } from '../core/presentation/consumers/user-settings.consumer';

export const commandHandlersProviders = [
  UpdateUserAvatarCommandHandler,
  CreateUserSettingsCommandHandler,
];

export const repositoriesProviders = [
  { provide: UserSettingsRepository, useClass: UserSettingsRepostitoryImpl },
];

export const consumersProviders = [UserSettingsConsumer];
