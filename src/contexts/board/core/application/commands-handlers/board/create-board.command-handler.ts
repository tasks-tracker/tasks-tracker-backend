import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from '../../commands';
import { BoardRepository } from '../../../domain';
import { BoardIdVO } from '../../../domain';
import { DomainError } from '@libs/domain-error';
import { err, ok, Result } from 'neverthrow';
import { Board } from '../../../domain';
import { BoardAlreadyExistDomainError } from '../../../domain';

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
