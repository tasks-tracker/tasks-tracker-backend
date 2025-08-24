import { ColumnIdVO } from '../../value-objects';

export class ColumnRemovedEvent {
  constructor(readonly id: ColumnIdVO) {}
}
