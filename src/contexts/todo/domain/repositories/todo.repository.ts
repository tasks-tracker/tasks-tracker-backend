import { TodoIdVO } from '@contexts/todo/domain/value-objects';
import { Todo } from '@contexts/todo/domain/aggregates';

export abstract class TodoRepository {
  public abstract nextId(): TodoIdVO;
  public abstract findById(todoId: TodoIdVO): Promise<Todo | null>;
  public abstract save(todo: Todo): Promise<void>;
}
