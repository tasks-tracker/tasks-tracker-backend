import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Board,
  BoardIdVO,
  BoardOwnerIdVO,
  BoardQueryRepository,
  BoardRepository,
  BoardTitleVO,
  Column,
  ColumnIdVO,
  ColumnOrderVO,
  ColumnOwnerIdVO,
  ColumnRepository,
  ColumnTitleVO,
  CreateDefaultBoardCommand,
  Task,
  TaskDescriptionVO,
  TaskIdVO,
  TaskOrderVO,
  TaskOwnerIdVO,
  TaskRepository,
  TaskTitleVO,
} from '@contexts/board/core';
import { err, Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { randomUUID } from 'node:crypto';
import {
  BOARD_ALREADY_EXISTS,
  DEFAULT_BOARD,
} from '@contexts/board/core/domain/constants';
import { defaultColumnsWithTasks } from '@contexts/board/core/domain/constants';
import { ok } from 'neverthrow';

@CommandHandler(CreateDefaultBoardCommand)
export class CreateDefaultBoardCommandHandler
  implements ICommandHandler<CreateDefaultBoardCommand>
{
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly boardQueryRepository: BoardQueryRepository,
    private readonly columnRepository: ColumnRepository,
    private readonly taskRepository: TaskRepository,
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
        new BoardOwnerIdVO(command.ownerId.value),
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
          new ColumnOwnerIdVO(command.ownerId.value),
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
            new TaskOwnerIdVO(command.ownerId.value),
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
