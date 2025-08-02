import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBoardsIdsByUserIdQuery } from '../../queries/board';
import { BoardQueryRepository } from '../../query-repositories';
import { Board } from '@contexts/board/core/domain/aggregates';
import {
  BoardIdVO,
  BoardOwnerIdVO,
  BoardTitleVO,
  BoardUserIdVO,
} from '@contexts/board/core/domain/value-objects';

@QueryHandler(GetBoardsIdsByUserIdQuery)
export class FindBoardsByUserIdQueryHandler
  implements IQueryHandler<GetBoardsIdsByUserIdQuery, Board[]>
{
  constructor(private readonly boardQueryRepository: BoardQueryRepository) {}

  async execute(query: GetBoardsIdsByUserIdQuery) {
    const result = await this.boardQueryRepository.findBoardsByUserId(
      new BoardUserIdVO(query.userId.value),
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
