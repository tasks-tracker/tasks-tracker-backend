import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserColumnIdsQuery } from '../../queries';
import { ColumnQueryRepository } from '../../query-repositories';
import { ColumnIdVO, ColumnOwnerIdVO } from '../../../domain';

@QueryHandler(GetUserColumnIdsQuery)
export class GetUserColumnIdsQueryHandler
  implements IQueryHandler<GetUserColumnIdsQuery, ColumnIdVO[]>
{
  constructor(private readonly columnQueryRepository: ColumnQueryRepository) {}

  async execute(query: GetUserColumnIdsQuery) {
    const result = await this.columnQueryRepository.getUserColumnIds(
      new ColumnOwnerIdVO(query.userId.value),
    );

    if (result.isErr()) return [];

    return result.value.map((id) => new ColumnIdVO(id.value));
  }
}
