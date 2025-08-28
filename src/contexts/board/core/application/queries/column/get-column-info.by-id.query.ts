import { Query } from '@nestjs/cqrs';
import { ColumnIdVO } from '../../../domain';
import { ColumnInterface } from '@contexts/board/core/domain/interfaces';

export class GetColumnInfoByIdQuery extends Query<ColumnInterface> {
  constructor(public readonly columnId: ColumnIdVO) {
    super();
  }
}
