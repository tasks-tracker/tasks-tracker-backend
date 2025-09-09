import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Board,
  BoardIdVO,
  UserIdVO,
  BoardRepository,
  BoardTitleVO,
  Column,
  ColumnIdVO,
  ColumnOrderVO,
  ColumnRepository,
  ColumnTitleVO,
  Task,
  TaskDescriptionVO,
  TaskIdVO,
  TaskOrderVO,
  TaskRepository,
  TaskTitleVO,
} from '../../../domain';
import { BoardQueryRepository } from '../../query-repositories';
import { CreateDefaultBoardCommand } from '../../commands';
import { err, Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { randomUUID } from 'node:crypto';
import {
  BOARD_ALREADY_EXISTS,
  DEFAULT_BOARD,
} from '@contexts/board/core/domain/constants';
import { defaultColumnsWithTasks } from '../../../domain';
import { ok } from 'neverthrow';
import { OutboxRepository } from '@adapters/database-adapter';

@CommandHandler(CreateDefaultBoardCommand)
export class CreateDefaultBoardCommandHandler
  implements ICommandHandler<CreateDefaultBoardCommand>
{
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardQueryRepository: BoardQueryRepository,
    private readonly columnRepository: ColumnRepository,
    private readonly taskRepository: TaskRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  async execute(
    command: CreateDefaultBoardCommand,
  ): Promise<Result<null, DomainError>> {
    try {
      const isExistBoard = await this.boardQueryRepository.existByUserId(
        command.ownerId.value,
      );

      if (isExistBoard.isOk() && isExistBoard.value) {
        return err(new DomainError(BOARD_ALREADY_EXISTS));
      }

      const board = Board.create(
        new BoardIdVO(randomUUID()),
        new BoardTitleVO(DEFAULT_BOARD),
        new UserIdVO(command.ownerId.value),
        new Date(),
        new Date(),
        false,
      );

      await this.boardRepository.save(board);

      for (const item of defaultColumnsWithTasks) {
        const column = Column.create(
          new ColumnIdVO(randomUUID()),
          new ColumnTitleVO(item.title),
          new ColumnOrderVO(item.order),
          new BoardIdVO(board.id.value),
          new Date(),
          new Date(),
          new UserIdVO(command.ownerId.value),
        );

        await this.columnRepository.save(column);

        for (let i = 0; i < item.tasks.length; i++) {
          const currentTask = item.tasks[i];

          const task = Task.create(
            new TaskIdVO(randomUUID()),
            new TaskTitleVO(currentTask.title),
            new TaskDescriptionVO(currentTask.description),
            new TaskOrderVO(i),
            new ColumnIdVO(column.id.value),
            new Date(),
            new Date(),
            new UserIdVO(command.ownerId.value),
            false,
          );

          await this.taskRepository.save(task);
        }
      }

      return ok(null);
    } catch (error) {
      return err(new DomainError(error as string));
    }
  }
}
