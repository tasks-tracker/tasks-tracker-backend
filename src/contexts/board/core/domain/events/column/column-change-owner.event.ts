import { ColumnOwnerIdVO } from '../../value-objects';

export class ColumnChangeOwnerEvent {
  constructor(
    readonly id: ColumnOwnerIdVO,
    readonly ownerId: ColumnOwnerIdVO,
  ) {}
}
