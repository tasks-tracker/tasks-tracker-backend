import type { UserIdVO } from '../../domain';

export interface UserInfo {
  id: string;
  login: string;
  registeredAt: Date;
}

export abstract class UserQueryRepository {
  public abstract getUserInfoById(userId: UserIdVO): Promise<UserInfo | null>;
}
