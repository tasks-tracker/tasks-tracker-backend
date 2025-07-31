import { TaskTitleVO } from '../../value-objects';

export class TaskRenameEvent {
  constructor(readonly id: TaskTitleVO) {}
}
