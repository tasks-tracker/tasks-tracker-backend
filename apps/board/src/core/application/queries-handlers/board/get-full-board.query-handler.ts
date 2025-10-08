import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFullBoardQuery } from '../../queries';
import { FullBoardResponse } from '../../../domain';
import {
  BoardQueryRepository,
  ColumnQueryRepository,
  TaskQueryRepository,
} from '../../query-repositories';
import { BoardIsNotFoundDomainError } from '../../../domain';

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
          id: board.id,
          title: board.title,
          owner: board.ownerId,
          ownerId: board.ownerId,
          createdAt: board.createdAt,
          userId: board.ownerId,
          updatedAt: board.updatedAt,
        },
        columns: columnWithTasks,
      };
    } catch (error) {
      console.error(error);
      throw new BoardIsNotFoundDomainError(query.userId.value);
    }
  }
}
