import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskInfoByIdQuery } from '../../queries';
import { TaskIdVO } from '../../../domain';
import { TaskNotFoundDomainError } from '../../../domain';
import { TaskQueryRepository } from '../../query-repositories';
import { Task } from '../../../domain';
import { TaskInterface } from '../../../domain';

@QueryHandler(GetTaskInfoByIdQuery)
export class GetTaskInfoByIdQueryHandler
  implements IQueryHandler<GetTaskInfoByIdQuery, Task>
{
  constructor(private readonly taskQueryRepository: TaskQueryRepository) {}

  async execute(query: GetTaskInfoByIdQuery): Promise<TaskInterface> {
    const result = await this.taskQueryRepository.findById(
      new TaskIdVO(query.taskId.value),
    );

    if (result.isErr()) {
      throw new TaskNotFoundDomainError(query.taskId.value);
    }

    const task = result.value;

    return {
      id: task.id.value,
      ownerId: task.assignerId.value,
      columnId: task.columnId.value,
      description: task.description.value,
      order: task.order.value,
      title: task.title.value,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
