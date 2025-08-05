import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindColumnsByUserIdQuery } from '../../queries';
import { ColumnQueryRepository } from '../../query-repositories';
import { Column } from '../../../domain';

@QueryHandler(FindColumnsByUserIdQuery)
export class FindColumnsByUserIdQueryHandler
  implements IQueryHandler<FindColumnsByUserIdQuery, Column[]>
{
  constructor(private readonly columnQueryRepository: ColumnQueryRepository) {}

  async execute(query: FindColumnsByUserIdQuery) {
    const result = await this.columnQueryRepository.findColumnsByUserId(
      query.userId,
    );

    if (result.isErr()) return [];

    return result.value;
  }
}
