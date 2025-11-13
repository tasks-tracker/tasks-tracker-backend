import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserSettingsQuery, GetUserSettingsQueryResponse } from '../queries';
import { UserNotFoundDomainError } from '../../domain';
import { UserSettingsQueryRepository } from '../query-repositories';

@QueryHandler(GetUserSettingsQuery)
export class GetUserSettingsQueryHandler
  implements IQueryHandler<GetUserSettingsQuery>
{
  constructor(
    public readonly userSettingsQueryRepository: UserSettingsQueryRepository,
  ) {}

  async execute(
    query: GetUserSettingsQuery,
  ): Promise<GetUserSettingsQueryResponse | UserNotFoundDomainError> {
    const result = await this.userSettingsQueryRepository.findById(
      query.userId,
    );

    if (result.isErr()) {
      return result.error;
    }

    const userSettings = result.value;

    const response: GetUserSettingsQueryResponse = {
      id: userSettings.id.value,
      userId: userSettings.userId.value,
      avatarUrl: userSettings.avatarUrl.value || '',
      settings: userSettings.settings,
      createdAt: userSettings.createdAt,
      updatedAt: userSettings.updatedAt,
    };

    return response;
  }
}
