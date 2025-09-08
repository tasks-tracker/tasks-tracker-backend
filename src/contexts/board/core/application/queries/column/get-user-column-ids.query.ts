import { Query } from '@nestjs/cqrs';
import { UserIdVO, ColumnIdVO } from '../../../domain';

export class GetUserColumnIdsQuery extends Query<ColumnIdVO[]> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
