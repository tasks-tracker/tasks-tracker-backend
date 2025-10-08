import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ExistByTitleBoardQuery } from '../../queries';
import { BoardQueryRepository } from '../../query-repositories';
import { BoardTitleVO } from '../../../domain';

@QueryHandler(ExistByTitleBoardQuery)
export class ExistByTitleBoardQueryHandler
  implements IQueryHandler<ExistByTitleBoardQuery, boolean>
{
  constructor(private readonly boardQueryRepository: BoardQueryRepository) {}

  async execute(query: ExistByTitleBoardQuery) {
    const result = await this.boardQueryRepository.existsByTitle(
      new BoardTitleVO(query.title.value),
    );

    if (result.isErr()) return false;
    return result.value;
  }
}
