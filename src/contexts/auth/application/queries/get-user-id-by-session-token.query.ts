import type { SessionTokenVO } from '../../domain';
import type { UserIdVO } from '../../domain';
import { Query } from '@nestjs/cqrs';

export class GetUserIdBySessionTokenQuery extends Query<UserIdVO | null> {
  constructor(public readonly sessionToken: SessionTokenVO) {
    super();
  }
}
