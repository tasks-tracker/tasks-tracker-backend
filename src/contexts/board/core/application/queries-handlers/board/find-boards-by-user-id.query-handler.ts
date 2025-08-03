import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindByUserIdQuery } from '../../queries/board';
import { BoardQueryRepository } from '../../query-repositories';
import { Board } from '@contexts/board/core/domain/aggregates';
import {
  BoardIdVO,
  BoardOwnerIdVO,
  BoardTitleVO,
} from '@contexts/board/core/domain/value-objects';

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
        new BoardOwnerIdVO(board.ownerId.value),
        new Date(board.createdAt),
        new Date(board.updatedAt),
      ),
    );
  }
}
