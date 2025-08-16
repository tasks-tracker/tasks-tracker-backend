import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeBoardOwnerCommand } from '../../commands/board';
import { BoardRepository } from '@contexts/board/core/domain/repositories/board.repository';
import { DomainError } from '@libs/domain-error';
import { err, ok, Result } from 'neverthrow';
import { BoardIsNotFoundDomainError } from '@contexts/board/core/domain/domain-errors';

@CommandHandler(ChangeBoardOwnerCommand)
export class ChangeBoardOwnerCommandHandler
  implements ICommandHandler<ChangeBoardOwnerCommand>
{
  constructor(public readonly boardRepository: BoardRepository) {}

  async execute(
    command: ChangeBoardOwnerCommand,
  ): Promise<Result<void, DomainError>> {
    const boardResult = await this.boardRepository.findById(command.boardId);

    if (boardResult.isErr()) {
      return err(new BoardIsNotFoundDomainError(command.boardId.value));
    }

    const board = boardResult.value;

    board.changeOwner(command.currentOwnerId, command.newOwnerId);

    await this.boardRepository.save(board);

    board.commit();
    return ok(undefined);
  }
}
