import { Query } from '@nestjs/cqrs';
import { BoardIdVO } from '../../../domain';
import { Column } from '../../../domain';

export class FindByBoardIdQuery extends Query<Column[]> {
  constructor(public readonly boardId: BoardIdVO) {
    super();
  }
}
