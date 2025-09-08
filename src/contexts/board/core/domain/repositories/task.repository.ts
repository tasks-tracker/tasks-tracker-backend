import { TaskIdVO } from '../value-objects';
import { TaskNotFoundDomainError } from '../domain-errors';
import { Result } from 'neverthrow';
import { Task } from '../aggregates';

export abstract class TaskRepository {
  public abstract nextId(): TaskIdVO;

  public abstract save(task: Task): Promise<void>;

  public abstract findById(
    id: TaskIdVO,
  ): Promise<Result<Task, TaskNotFoundDomainError>>;
}
