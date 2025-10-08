import { Query } from '@nestjs/cqrs';
import { ColumnIdVO } from '../../../domain';
import { ColumnInterface } from '../../../domain';

export class GetColumnInfoByIdQuery extends Query<ColumnInterface> {
  constructor(public readonly columnId: ColumnIdVO) {
    super();
  }
}
