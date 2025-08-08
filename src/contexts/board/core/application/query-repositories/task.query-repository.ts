import { Result } from 'neverthrow';
import { TaskNotFoundDomainError } from '../../domain';
import { TaskIdVO } from '../../domain/value-objects';
import { Task } from '../../domain/aggregates/task.aggregate';

export abstract class TaskQueryRepository {
  public abstract findById(
    id: TaskIdVO,
  ): Promise<Result<Task, TaskNotFoundDomainError>>;
}
