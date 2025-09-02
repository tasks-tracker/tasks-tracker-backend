import { Query } from '@nestjs/cqrs';
import { Board } from '../../../domain';
import { UserIdVO } from '../../../domain';

export class FindByUserIdQuery extends Query<Board[]> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
