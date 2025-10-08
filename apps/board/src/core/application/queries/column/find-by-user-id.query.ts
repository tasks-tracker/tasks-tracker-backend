import { Query } from '@nestjs/cqrs';
import { UserIdVO } from '../../../domain';
import { ColumnInterface } from '../../../domain';

export class FindColumnsByUserIdQuery extends Query<ColumnInterface[]> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
