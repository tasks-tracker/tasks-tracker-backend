import { Query } from '@nestjs/cqrs';
import { TaskIdVO } from '../../../domain';
import { TaskInterface } from '../../../domain';

export class GetTaskInfoByIdQuery extends Query<TaskInterface> {
  constructor(public readonly taskId: TaskIdVO) {
    super();
  }
}
