import { ColumnOwnerIdVO, TaskIdVO } from '../../value-objects';

export class TaskChangeOwnerEvent {
  constructor(
    readonly id: TaskIdVO,
    readonly ownerId: ColumnOwnerIdVO,
  ) {}
}
