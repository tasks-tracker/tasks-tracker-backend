import { TaskIdVO, TaskTitleVO } from '../../value-objects';

export class TaskChangeTitleEvent {
  constructor(
    readonly taskId: TaskIdVO,
    readonly title: TaskTitleVO,
  ) {}
}
