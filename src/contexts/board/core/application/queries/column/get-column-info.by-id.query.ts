import { Query } from '@nestjs/cqrs';
import { ColumnIdVO } from '../../../domain';
import { Column } from '../../../domain';

export class GetColumnInfoByIdQuery extends Query<Column> {
  constructor(public readonly columnId: ColumnIdVO) {
    super();
  }
}
