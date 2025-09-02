import { UserIdVO, TaskIdVO } from '../../value-objects';

export class TaskChangeOwnerEvent {
  constructor(
    readonly id: TaskIdVO,
    readonly ownerId: UserIdVO,
  ) {}
}
