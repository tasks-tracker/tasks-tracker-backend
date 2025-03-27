import { TodoIdVO } from '@contexts/todo/domain/value-objects';
import { Todo } from '@contexts/todo/domain/aggregates';

export abstract class TodoRepository {
  public abstract nextId(): TodoIdVO;

  public abstract save(todo: Todo): Promise<void>;

  public abstract getTodoById(id: TodoIdVO): Promise<Todo | null>;

  public abstract getAllTodo(): Promise<Todo[] | null>;

  public abstract delete(id: TodoIdVO): Promise<void>;
}
