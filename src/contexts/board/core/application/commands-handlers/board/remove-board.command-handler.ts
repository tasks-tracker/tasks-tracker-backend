import { err, Result, ok } from 'neverthrow';
import { DomainError } from '@libs/domain-error';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveBoardCommand } from '../../commands';
import { BoardIdVO } from '@contexts/board/core/domain/value-objects';
import { BoardRepository } from '@contexts/board/core/domain/repositories/board.repository';
import { BoardIsNotFoundDomainError } from '@contexts/board/core/domain/domain-errors';

@CommandHandler(RemoveBoardCommand)
export class RemoveBoardCommandHandler
  implements ICommandHandler<RemoveBoardCommand>
{
  constructor(public readonly boardRepository: BoardRepository) {}

  async execute(
    command: RemoveBoardCommand,
  ): Promise<Result<BoardIdVO, DomainError>> {
    const boardResult = await this.boardRepository.findById(command.boardId);

    if (!boardResult) {
      return err(new BoardIsNotFoundDomainError(command.boardId.value));
    }

    const board = boardResult;

    board.remove(command.userId);

    await this.boardRepository.save(board);

    board.commit();

    return ok(command.boardId);
  }
}
