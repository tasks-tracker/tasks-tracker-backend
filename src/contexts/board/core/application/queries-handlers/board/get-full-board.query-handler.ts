import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFullBoardQuery } from '../../queries/board';
import { FullBoardResponse } from '@contexts/board/core/domain/interfaces';
import {
  BoardQueryRepository,
  ColumnQueryRepository,
  TaskQueryRepository,
} from '../../query-repositories';
import { BoardIsNotFoundDomainError } from '@contexts/board/core/domain/domain-errors';

@QueryHandler(GetFullBoardQuery)
export class GetFullBoardQueryHandler
  implements IQueryHandler<GetFullBoardQuery, FullBoardResponse>
{
  constructor(
    private readonly boardQueryRepository: BoardQueryRepository,
    private readonly columnQueryRepository: ColumnQueryRepository,
    private readonly taskQueryRepository: TaskQueryRepository,
  ) {}

  async execute(query: GetFullBoardQuery): Promise<FullBoardResponse> {
    try {
      const boardsResult = await this.boardQueryRepository.findBoardsByUserId(
        query.userId,
      );
      const columnsResult =
        await this.columnQueryRepository.findColumnsByUserId(query.userId);

      const tasksResult = await this.taskQueryRepository.findTasksByUserId(
        query.userId,
      );

      if (boardsResult.isErr()) {
        throw boardsResult.error;
      }

      if (columnsResult.isErr()) {
        throw columnsResult.error;
      }

      if (tasksResult.isErr()) {
        throw tasksResult.error;
      }

      const board = boardsResult.value[0];
      const columns = columnsResult.value;
      const tasks = tasksResult.value;

      const columnWithTasks = columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.columnId === column.id);

        return {
          ...column,
          tasks: columnTasks,
        };
      });

      return {
        board: {
          id: board.id.value,
          title: board.title.value,
          owner: board.ownerId.value,
          ownerId: board.ownerId.value,
          createdAt: board.createdAt.toISOString(),
          userId: board.ownerId.value,
          updatedAt: board.updatedAt.toISOString(),
        },
        columns: columnWithTasks,
      };
    } catch (error) {
      console.error(error);
      throw new BoardIsNotFoundDomainError(query.userId.value);
    }
  }
}
