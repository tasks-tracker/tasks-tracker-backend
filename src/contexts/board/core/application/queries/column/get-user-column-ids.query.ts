import { Query } from '@nestjs/cqrs';
import { ColumnOwnerIdVO, ColumnIdVO } from '../../../domain';

export class GetUserColumnIdsQuery extends Query<ColumnIdVO[]> {
  constructor(public readonly userId: ColumnOwnerIdVO) {
    super();
  }
}
