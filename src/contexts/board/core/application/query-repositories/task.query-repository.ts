import { Result } from 'neverthrow';
import { TaskNotFoundDomainError } from '../../domain';
import { TaskIdVO } from '../../domain/value-objects';
import { Task } from '../../domain/aggregates/task.aggregate';
import { UserIdVO } from '@contexts/auth';
import { TaskInterface } from '../../domain/interfaces';

export abstract class TaskQueryRepository {
  public abstract findById(
    id: TaskIdVO,
  ): Promise<Result<Task, TaskNotFoundDomainError>>;

  public abstract findTasksByUserId(
    userId: UserIdVO,
  ): Promise<Result<TaskInterface[], TaskNotFoundDomainError>>;
}
