import type { IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';
import { GetUserIdBySessionTokenQuery } from '../queries';
import { SessionRepository } from '../../domain';

@QueryHandler(GetUserIdBySessionTokenQuery)
export class GetUserIdBySessionTokenQueryHandler
  implements IQueryHandler<GetUserIdBySessionTokenQuery, string>
{
  constructor(public readonly sessionRepository: SessionRepository) {}
  async execute(query: GetUserIdBySessionTokenQuery) {
    const result = await this.sessionRepository.getUserIdBySessionToken(
      query.sessionToken,
    );
    if (result.isErr()) return null;
    return result.value;
  }
}
