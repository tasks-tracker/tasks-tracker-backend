import { UserSettingsRepository } from '../core/domain';
import { UserSettingsRepostitoryImpl } from '../core/infrastructure/repositories/user-settings.repository';
import {
  CreateUserSettingsCommandHandler,
  UpdateUserAvatarCommandHandler,
  UpdateUserSettingsCommandHandler,
} from '../core/application/commands-handlers';
import { UserSettingsConsumer } from '../core/presentation/consumers/user-settings.consumer';
import { GetUserSettingsQueryHandler } from '../core/application/queries-handlers/get-user-settings.query-handler';
import { UserSettingsQueryRepository } from '../core/application/query-repositories';
import { UserSettingsQueryRepositoryImpl } from '../core/infrastructure/query-repositories/user-settings.query-repository';

export const commandHandlersProviders = [
  UpdateUserAvatarCommandHandler,
  CreateUserSettingsCommandHandler,
  UpdateUserSettingsCommandHandler,
];

export const queryHandlersProviders = [GetUserSettingsQueryHandler];

export const repositoriesProviders = [
  { provide: UserSettingsRepository, useClass: UserSettingsRepostitoryImpl },
  {
    provide: UserSettingsQueryRepository,
    useClass: UserSettingsQueryRepositoryImpl,
  },
];

export const consumersProviders = [UserSettingsConsumer];
