import { Query } from '@nestjs/cqrs';
import { TaskIdVO } from '../../../domain';
import { Task } from '../../../domain';

export class GetTaskInfoByIdQuery extends Query<Task> {
  constructor(public readonly taskId: TaskIdVO) {
    super();
  }
}
