import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from '../../commands/board';
import { BoardRepository } from '@contexts/board/core/domain/repositories/board.repository';
import { BoardIdVO } from '@contexts/board/core/domain/value-objects';
import { DomainError } from '@libs/domain-error';
import { err, ok, Result } from 'neverthrow';
import { Board } from '@contexts/board/core/domain/aggregates';

@CommandHandler(CreateBoardCommand)
export class CreateBoardCommandHandler
  implements ICommandHandler<CreateBoardCommand>
{
  constructor(public readonly boardRepository: BoardRepository) {}

  async execute(
    command: CreateBoardCommand,
  ): Promise<Result<BoardIdVO, DomainError>> {
    const boardId = this.boardRepository.nextId();
    const date = new Date();
    const userIdResult = await this.boardRepository.getUserId(command.ownerId);

    if (userIdResult.isErr()) {
      return err(userIdResult.error);
    }

    const userId = userIdResult.value;
    const board = Board.create(boardId, command.title, userId, date, date);

    const saveResult = await this.boardRepository.save(board);

    if (saveResult.isErr()) {
      return err(saveResult.error);
    }

    board.commit();

    return ok(board.id);
  }
}
