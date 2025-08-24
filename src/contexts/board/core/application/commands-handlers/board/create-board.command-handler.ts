import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from '../../commands/board';
import { BoardRepository } from '@contexts/board/core/domain/repositories/board.repository';
import { BoardIdVO } from '@contexts/board/core/domain/value-objects';
import { DomainError } from '@libs/domain-error';
import { err, ok, Result } from 'neverthrow';
import { Board } from '@contexts/board/core/domain/aggregates';
import { BoardAlreadyExistDomainError } from '@contexts/board/core/domain/domain-errors';

@CommandHandler(CreateBoardCommand)
export class CreateBoardCommandHandler
  implements ICommandHandler<CreateBoardCommand>
{
  constructor(public readonly boardRepository: BoardRepository) {}

  async execute(
    command: CreateBoardCommand,
  ): Promise<Result<BoardIdVO, DomainError>> {
    const boardIdResult = await this.boardRepository.findByTitle(command.title);

    if (boardIdResult.isOk()) {
      return err(new BoardAlreadyExistDomainError(command.title.value));
    }

    const boardId = this.boardRepository.nextId();
    const date = new Date();

    const board = Board.create(
      boardId,
      command.title,
      command.ownerId,
      date,
      date,
      false,
    );

    await this.boardRepository.save(board);

    board.commit();

    return ok(board.id);
  }
}
