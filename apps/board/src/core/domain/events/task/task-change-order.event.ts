import { TaskIdVO, TaskOrderVO } from '../../value-objects';

export class TaskChangeOrderEvent {
  constructor(
    readonly id: TaskIdVO,
    readonly order: TaskOrderVO,
  ) {}
}
