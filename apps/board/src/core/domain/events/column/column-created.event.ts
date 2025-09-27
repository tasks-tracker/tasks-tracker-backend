import { ColumnIdVO } from '../../value-objects';

export class ColumnCreatedEvent {
  constructor(readonly id: ColumnIdVO) {}
}
