import { Query } from '@nestjs/cqrs';
import { BoardTitleVO } from '../../../domain';

export class ExistByTitleBoardQuery extends Query<boolean> {
  constructor(public readonly title: BoardTitleVO) {
    super();
  }
}
