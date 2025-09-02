import { Result } from 'neverthrow';
import { TaskNotFoundDomainError } from '../../domain';
import { TaskIdVO } from '../../domain';
import { Task } from '../../domain';
import { UserIdVO } from '../../domain';
import { TaskInterface } from '../../domain';

export abstract class TaskQueryRepository {
  public abstract findById(
    id: TaskIdVO,
  ): Promise<Result<Task, TaskNotFoundDomainError>>;

  public abstract findTasksByUserId(
    userId: UserIdVO,
  ): Promise<Result<TaskInterface[], TaskNotFoundDomainError>>;
}
