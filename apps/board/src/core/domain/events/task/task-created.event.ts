import { TaskIdVO } from '../../value-objects';

export class TaskCreatedEvent {
  constructor(readonly id: TaskIdVO) {}
}
