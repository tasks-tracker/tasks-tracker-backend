import { err, Result, ok } from 'neverthrow';
import type { DomainError } from 'libs/domain-error';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RenameBoardCommand } from '../../commands';
import { BoardIdVO } from '../../../domain';
import { BoardRepository } from '../../../domain';
import { BoardIsNotFoundDomainError } from '../../../domain';

@CommandHandler(RenameBoardCommand)
export class RenameBoardCommandHandler
  implements ICommandHandler<RenameBoardCommand>
{
  constructor(public readonly boardRepository: BoardRepository) {}

  async execute(
    command: RenameBoardCommand,
  ): Promise<Result<BoardIdVO, DomainError>> {
    const boardResult = await this.boardRepository.findById(command.boardId);

    if (boardResult.isErr()) {
      return err(new BoardIsNotFoundDomainError(command.boardId.value));
    }

    const board = boardResult.value;

    board.rename(command.newTitle, command.userId);

    await this.boardRepository.save(board);

    board.commit();

    return ok(board.id);
  }
}
