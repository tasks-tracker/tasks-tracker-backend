import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ExistByUserIdQuery } from '../../queries/board';
import { BoardQueryRepository } from '../../query-repositories';

@QueryHandler(ExistByUserIdQuery)
export class ExistByUserIdQueryHandler
  implements IQueryHandler<ExistByUserIdQuery, boolean>
{
  constructor(private readonly boardQueryRepository: BoardQueryRepository) {}

  async execute(query: ExistByUserIdQuery) {
    const result = await this.boardQueryRepository.existByUserId(query.userId);

    if (result.isErr()) return false;
    return result.value;
  }
}
