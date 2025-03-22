import type { SessionIdVO } from '../value-objects';

export abstract class SessionRepository {
  public abstract nextId(): SessionIdVO;
}
