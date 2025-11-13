import { Query } from '@nestjs/cqrs';
import { UserIdVO, UserNotFoundDomainError } from '../../domain';

export interface GetUserSettingsQueryResponse {
  avatarUrl: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  userId: string;
}

export class GetUserSettingsQuery extends Query<
  GetUserSettingsQueryResponse | UserNotFoundDomainError
> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
