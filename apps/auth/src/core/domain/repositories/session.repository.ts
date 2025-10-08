import type { SessionIdVO } from '../value-objects';
import type { SessionTokenVO } from '../value-objects';
import type { UserIdVO } from '../value-objects';
import type { NotUsedSessionTokenDomainError } from '../domain-errors';
import type { Result } from 'neverthrow';

export abstract class SessionRepository {
  public abstract nextId(): SessionIdVO;
  public abstract deleteSession(
    sessionToken: SessionTokenVO,
  ): Promise<Result<null, NotUsedSessionTokenDomainError>>;
  public abstract getUserIdBySessionToken(
    sessionToken: SessionTokenVO,
  ): Promise<Result<UserIdVO, NotUsedSessionTokenDomainError>>;
}
