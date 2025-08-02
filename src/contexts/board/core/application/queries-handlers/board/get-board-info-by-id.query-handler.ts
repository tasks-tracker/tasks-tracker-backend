import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBoardInfoByIdQuery } from '../../queries/board';
import { BoardQueryRepository } from '../../query-repositories';
import { BoardIsNotFoundDomainError } from '@contexts/board/core/domain/domain-errors';

@QueryHandler(GetBoardInfoByIdQuery)
export class GetBoardInfoByIdQueryHandler
  implements IQueryHandler<GetBoardInfoByIdQuery, string>
{
  constructor(private readonly boardQueryRepository: BoardQueryRepository) {}

  async execute(query: GetBoardInfoByIdQuery) {
    const result = await this.boardQueryRepository.getBoardInfoById(
      query.boardId,
    );

    if (result.isErr()) {
      throw new BoardIsNotFoundDomainError(query.boardId.value);
    }

    return result.value;
  }
}
