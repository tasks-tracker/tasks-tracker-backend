import { ColumnIdVO } from '../../value-objects';

export class ColumnChangeBoardEvent {
  constructor(readonly id: ColumnIdVO) {}
}
