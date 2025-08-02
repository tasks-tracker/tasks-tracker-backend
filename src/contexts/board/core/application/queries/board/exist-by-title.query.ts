import { Query } from '@nestjs/cqrs';
import { BoardTitleVO } from '@contexts/board/core/domain/value-objects';

export class ExistByTitleBoardQuery extends Query<boolean> {
  constructor(public readonly title: BoardTitleVO) {
    super();
  }
}
