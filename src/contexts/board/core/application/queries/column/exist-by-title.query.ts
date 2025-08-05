import { Query } from '@nestjs/cqrs';
import { ColumnTitleVO } from '../../../domain';

export class ExistByTitleColumnQuery extends Query<boolean> {
  constructor(public readonly title: ColumnTitleVO) {
    super();
  }
}
