import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetColumnInfoByIdQuery } from '../../queries';
import { ColumnQueryRepository } from '../../query-repositories';
import {
  ColumnIdVO,
  ColumnTitleVO,
  ColumnOrderVO,
  ColumnOwnerIdVO,
  ColumnNotFoundDomainError,
} from '../../../domain';
import { BoardIdVO } from '../../../domain';
import { Column } from '../../../domain/aggregates';
import { Result } from 'neverthrow';

@QueryHandler(GetColumnInfoByIdQuery)
export class GetColumnInfoByIdQueryHandler
  implements
    IQueryHandler<
      GetColumnInfoByIdQuery,
      Result<Column, ColumnNotFoundDomainError>
    >
{
  constructor(private readonly columnQueryRepository: ColumnQueryRepository) {}

  async execute(query: GetColumnInfoByIdQuery): Promise<Column> {
    const result = await this.columnQueryRepository.findById(
      new ColumnIdVO(query.columnId.value),
    );

    if (result.isErr()) {
      throw result.error;
    }

    const column = result.value;

    return Column.create(
      new ColumnIdVO(column.id.value),
      new ColumnTitleVO(column.title.value),
      new ColumnOrderVO(column.order.value),
      new BoardIdVO(column.boardId.value),
      new Date(column.craetedAt),
      new Date(column.updatedAt),
      new ColumnOwnerIdVO(column.creatorId.value),
    );
  }
}
