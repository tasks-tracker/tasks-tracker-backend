import { UserIdVO } from '../value-objects';
import { UserSettings } from '../aggregates';
import { UserNotFoundDomainError } from '../domain-errors';
import { Result } from 'neverthrow';

export abstract class UserSettingsRepository {
  public abstract nextId(): UserIdVO;

  public abstract save(user: UserSettings): Promise<void>;

  public abstract findById(
    id: UserIdVO,
  ): Promise<Result<UserSettings, UserNotFoundDomainError>>;
}
