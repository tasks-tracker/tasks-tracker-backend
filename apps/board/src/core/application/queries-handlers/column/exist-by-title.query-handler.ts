import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ExistByTitleColumnQuery } from '../../queries';
import { ColumnQueryRepository } from '../../query-repositories';
import { ColumnTitleVO } from '../../../domain';

@QueryHandler(ExistByTitleColumnQuery)
export class ExistByTitleColumnQueryHandler
  implements IQueryHandler<ExistByTitleColumnQuery, boolean>
{
  constructor(private readonly columnQueryRepository: ColumnQueryRepository) {}

  async execute(query: ExistByTitleColumnQuery) {
    const result = await this.columnQueryRepository.existsByTitle(
      new ColumnTitleVO(query.title.value),
    );

    if (result.isErr()) return false;
    return result.value;
  }
}
