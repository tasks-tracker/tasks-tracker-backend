import { Query } from '@nestjs/cqrs';
import { BoardIdVO } from '@contexts/board/core/domain/value-objects';
import { Board } from '@contexts/board/core/domain/aggregates';

export class GetBoardInfoByIdQuery extends Query<Board> {
  constructor(public readonly boardId: BoardIdVO) {
    super();
  }
}
