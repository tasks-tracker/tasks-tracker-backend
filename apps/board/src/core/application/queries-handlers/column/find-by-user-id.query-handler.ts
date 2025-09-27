import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindColumnsByUserIdQuery } from '../../queries';
import { ColumnQueryRepository } from '../../query-repositories';
import { ColumnInterface } from '../../../domain';

@QueryHandler(FindColumnsByUserIdQuery)
export class FindColumnsByUserIdQueryHandler
  implements IQueryHandler<FindColumnsByUserIdQuery, ColumnInterface[]>
{
  constructor(private readonly columnQueryRepository: ColumnQueryRepository) {}

  async execute(query: FindColumnsByUserIdQuery): Promise<ColumnInterface[]> {
    const columns = await this.columnQueryRepository.findColumnsByUserId(
      query.userId,
    );

    if (columns.isErr()) throw columns.error;

    return columns.value;
  }
}
