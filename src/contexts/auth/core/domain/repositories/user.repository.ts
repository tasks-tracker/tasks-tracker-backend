import type { User } from '../aggregates';
import type { UserLoginAlreadyUsedDomainError } from '../domain-errors';
import type { UserIdVO } from '../value-objects';
import type { LoginVO } from '../value-objects';
import type { Result } from 'neverthrow';

export abstract class UserRepository {
  public abstract nextId(): UserIdVO;
  public abstract save(
    user: User,
  ): Promise<Result<null, UserLoginAlreadyUsedDomainError>>;
  public abstract getUserByLogin(login: LoginVO): Promise<User | null>;
}
