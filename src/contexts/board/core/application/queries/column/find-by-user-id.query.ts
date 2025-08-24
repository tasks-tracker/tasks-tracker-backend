import { Query } from '@nestjs/cqrs';
import { ColumnOwnerIdVO } from '../../../domain';
import { ColumnInterface } from '../../../domain/interfaces';

export class FindColumnsByUserIdQuery extends Query<ColumnInterface[]> {
  constructor(public readonly userId: ColumnOwnerIdVO) {
    super();
  }
}
