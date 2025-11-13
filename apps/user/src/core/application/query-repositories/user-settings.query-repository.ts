import { Result } from 'neverthrow';
import { UserNotFoundDomainError, UserSettings } from '../../domain';
import { UserIdVO } from '../../domain';

export abstract class UserSettingsQueryRepository {
  public abstract findById(
    id: UserIdVO,
  ): Promise<Result<UserSettings, UserNotFoundDomainError>>;
}
