import { Query } from '@nestjs/cqrs';
import { ColumnOwnerIdVO } from '../../../domain';
import { Column } from '../../../domain';

export class FindColumnsByUserIdQuery extends Query<Column[]> {
  constructor(public readonly userId: ColumnOwnerIdVO) {
    super();
  }
}
