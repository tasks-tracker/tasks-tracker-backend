import { UserIdVO } from '../value-objects';
import { User } from '../aggregates';

export abstract class UserRepository {
  public abstract nextId(): UserIdVO;

  public abstract save(user: User): Promise<void>;

  public abstract findById(id: UserIdVO): Promise<User | null>;
}
