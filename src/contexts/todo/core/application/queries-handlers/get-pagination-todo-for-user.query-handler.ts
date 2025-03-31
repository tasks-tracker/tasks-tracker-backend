import type { IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';
import { GetPaginationTodoForUserQuery } from '../queries';
import { TodoQueryRepository } from '../query-repositories';

@QueryHandler(GetPaginationTodoForUserQuery)
export class GetPaginationTodoForUserQueryHandler
  implements IQueryHandler<GetPaginationTodoForUserQuery, string> {
  constructor(
    private readonly todoQueryRepository: TodoQueryRepository,
  ) { }
  async execute(query: GetPaginationTodoForUserQuery) {
    const todos = await this.todoQueryRepository.getPaginationTodosByUserId(
      query.userId,
      query.limit.value,
      query.offset.value,
    );
    return todos;
  }
}
