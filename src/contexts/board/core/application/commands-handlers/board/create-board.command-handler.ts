import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from '../../commands/board';
import { BoardRepository } from '@contexts/board/core/domain/repositories/board.repository';
import { BoardIdVO } from '@contexts/board/core/domain/value-objects';
import { DomainError } from '@libs/domain-error';
import { ok, Result } from 'neverthrow';
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

    const board = Board.create(
      boardId,
      command.title,
      command.ownerId,
      date,
      date,
    );

    await this.boardRepository.save(board);

    board.commit();

    return ok(board.id);
  }
}
