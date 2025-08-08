import { ColumnIdVO, TaskIdVO } from '../../value-objects';

export class TaskChangeColumnEvent {
  constructor(
    readonly id: TaskIdVO,
    readonly columnId: ColumnIdVO,
  ) {}
}
