import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindByUserIdQuery } from '../../queries';
import { BoardQueryRepository } from '../../query-repositories';
import { FullBoardResponse } from '../../../domain';

@QueryHandler(FindByUserIdQuery)
export class FindBoardsByUserIdQueryHandler
  implements
    IQueryHandler<
      FindByUserIdQuery,
      Pick<FullBoardResponse, 'board'>['board'][]
    >
{
  constructor(private readonly boardQueryRepository: BoardQueryRepository) {}

  async execute(query: FindByUserIdQuery) {
    const result = await this.boardQueryRepository.findBoardsByUserId(
      query.userId,
    );

    if (result.isErr()) return [];

    const boards = result.value;

    return boards;
  }
}
