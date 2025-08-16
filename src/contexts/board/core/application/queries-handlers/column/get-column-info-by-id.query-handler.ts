import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetColumnInfoByIdQuery } from '../../queries';
import { ColumnQueryRepository } from '../../query-repositories';
import { ColumnIdVO, ColumnNotFoundDomainError } from '../../../domain';
import { Result } from 'neverthrow';
import { ColumnInterface } from '@contexts/board/core/domain/interfaces';

@QueryHandler(GetColumnInfoByIdQuery)
export class GetColumnInfoByIdQueryHandler
  implements
    IQueryHandler<
      GetColumnInfoByIdQuery,
      Result<ColumnInterface, ColumnNotFoundDomainError>
    >
{
  constructor(private readonly columnQueryRepository: ColumnQueryRepository) {}

  async execute(query: GetColumnInfoByIdQuery): Promise<ColumnInterface> {
    const result = await this.columnQueryRepository.findById(
      new ColumnIdVO(query.columnId.value),
    );

    if (result.isErr()) {
      throw result.error;
    }

    const column = result.value;

    return {
      id: column.id.value,
      boardId: column.boardId.value,
      createdAt: column.craetedAt,
      order: column.order.value,
      title: column.title.value,
      updatedAt: column.updatedAt,
      creatorId: column.creatorId.value,
      isDeleted: column.isDeleted,
    };
  }
}
