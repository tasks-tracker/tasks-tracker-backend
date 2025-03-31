import type { UserIdVO } from '../../domain';

export interface ToDoQuery {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  isDeleted: boolean;
  deadline: Date | null;
}

export abstract class TodoQueryRepository {
  public abstract getPaginationTodosByUserId(
    userId: UserIdVO,
    limit: number,
    offset: number,
  ): Promise<Array<ToDoQuery>>;
}
