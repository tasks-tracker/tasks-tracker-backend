import { err, Result, ok } from 'neverthrow';
import { DomainError } from '@libs/domain-error';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveBoardCommand } from '../../commands';
import { BoardRepository } from '@contexts/board/core/domain/repositories/board.repository';
import { BoardIsNotFoundDomainError } from '@contexts/board/core/domain/domain-errors';

@CommandHandler(RemoveBoardCommand)
export class RemoveBoardCommandHandler
  implements ICommandHandler<RemoveBoardCommand>
{
  constructor(public readonly boardRepository: BoardRepository) {}

  async execute(
    command: RemoveBoardCommand,
  ): Promise<Result<void, DomainError>> {
    try {
      const boardResult = await this.boardRepository.findById(command.boardId);

      if (boardResult.isErr()) {
        return err(new BoardIsNotFoundDomainError(command.boardId.value));
      }

      const board = boardResult.value;
      board.remove();

      await this.boardRepository.save(board);

      return ok(undefined);
    } catch (error) {
      console.log(error);
      return err(new BoardIsNotFoundDomainError(command.boardId.value));
    }
  }
}
