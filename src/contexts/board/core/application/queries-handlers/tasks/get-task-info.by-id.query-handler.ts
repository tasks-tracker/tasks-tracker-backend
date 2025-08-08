import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskInfoByIdQuery } from '../../queries';
import {
  TaskIdVO,
  TaskTitleVO,
  TaskDescriptionVO,
  TaskOrderVO,
  ColumnIdVO,
} from '../../../domain/value-objects';
import { TaskNotFoundDomainError, TaskOwnerIdVO } from '../../../domain';
import { TaskQueryRepository } from '../../query-repositories';
import { Task } from '../../../domain/aggregates/task.aggregate';

@QueryHandler(GetTaskInfoByIdQuery)
export class GetTaskInfoByIdQueryHandler
  implements IQueryHandler<GetTaskInfoByIdQuery, Task>
{
  constructor(private readonly taskQueryRepository: TaskQueryRepository) {}

  async execute(query: GetTaskInfoByIdQuery): Promise<Task> {
    const result = await this.taskQueryRepository.findById(
      new TaskIdVO(query.taskId.value),
    );

    if (result.isErr()) {
      throw new TaskNotFoundDomainError(query.taskId.value);
    }

    const task = result.value;

    return Task.create(
      new TaskIdVO(task.id.value),
      new TaskTitleVO(task.title.value),
      new TaskDescriptionVO(task.description.value),
      new TaskOrderVO(task.order.value),
      new ColumnIdVO(task.columnId.value),
      new Date(task.createdAt),
      new Date(task.updatedAt),
      new TaskOwnerIdVO(task.assignerId.value),
      false,
    );
  }
}
