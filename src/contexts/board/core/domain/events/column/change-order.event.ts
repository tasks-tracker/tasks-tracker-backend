import type { ColumnOrderVO } from '../../value-objects';

export class ColumnChangeOrderEvent {
  constructor(readonly order: ColumnOrderVO) {}
}
