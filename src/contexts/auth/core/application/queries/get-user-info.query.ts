import type { UserIdVO } from '../../domain';
import type { UserInfo } from '../query-repositories';
import { Query } from '@nestjs/cqrs';

export class GetUserInfoQuery extends Query<UserInfo | null> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
