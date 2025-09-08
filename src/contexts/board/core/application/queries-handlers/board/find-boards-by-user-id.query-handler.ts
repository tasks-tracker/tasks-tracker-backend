import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindByUserIdQuery } from '../../queries';
import { BoardQueryRepository } from '../../query-repositories';
import { Board } from '../../../domain';
import { BoardIdVO, UserIdVO, BoardTitleVO } from '../../../domain';

@QueryHandler(FindByUserIdQuery)
export class FindBoardsByUserIdQueryHandler
  implements IQueryHandler<FindByUserIdQuery, Board[]>
{
  constructor(private readonly boardQueryRepository: BoardQueryRepository) {}

  async execute(query: FindByUserIdQuery) {
    const result = await this.boardQueryRepository.findBoardsByUserId(
      query.userId,
    );

    if (result.isErr()) return [];

    const boards = result.value;

    return boards.map((board) =>
      Board.create(
        new BoardIdVO(board.id.value),
        new BoardTitleVO(board.title.value),
        new UserIdVO(board.ownerId.value),
        new Date(board.createdAt),
        new Date(board.updatedAt),
        board.isDeleted,
      ),
    );
  }
}
