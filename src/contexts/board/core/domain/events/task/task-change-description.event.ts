import { TaskDescriptionVO, TaskIdVO } from '../../value-objects';

export class TaskChangeDescriptionEvent {
  constructor(
    readonly id: TaskIdVO,
    readonly description: TaskDescriptionVO,
  ) {}
}
