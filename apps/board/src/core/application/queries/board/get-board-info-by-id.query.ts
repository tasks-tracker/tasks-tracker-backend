import { Query } from '@nestjs/cqrs';
import { BoardIdVO } from '../../../domain';
import { Board } from '../../../domain';

export class GetBoardInfoByIdQuery extends Query<Board> {
  constructor(public readonly boardId: BoardIdVO) {
    super();
  }
}
