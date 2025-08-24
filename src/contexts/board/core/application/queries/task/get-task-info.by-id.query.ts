import { Query } from '@nestjs/cqrs';
import { TaskIdVO } from '../../../domain';
import { TaskInterface } from '@contexts/board/core/domain/interfaces/task.interface';

export class GetTaskInfoByIdQuery extends Query<TaskInterface> {
  constructor(public readonly taskId: TaskIdVO) {
    super();
  }
}
