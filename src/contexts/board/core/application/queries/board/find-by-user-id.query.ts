import { Query } from '@nestjs/cqrs';
import { Board } from '@contexts/board/core/domain/aggregates';
import { BoardUserIdVO } from '@contexts/board/core/domain/value-objects';

export class FindByUserIdQuery extends Query<Board[]> {
  constructor(public readonly userId: BoardUserIdVO) {
    super();
  }
}
