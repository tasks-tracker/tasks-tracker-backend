import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeColumnBoardCommand } from '../../commands';
import {
  BoardIdVO,
  ColumnNotFoundDomainError,
  ColumnRepository,
} from '../../../domain';
import { err, Result, ok } from 'neverthrow';

@CommandHandler(ChangeColumnBoardCommand)
export class ChangeColumnBoardCommandHandler
  implements ICommandHandler<ChangeColumnBoardCommand>
{
  constructor(private readonly columnRepository: ColumnRepository) {}

  async execute(
    command: ChangeColumnBoardCommand,
  ): Promise<Result<void, ColumnNotFoundDomainError>> {
    try {
      const columnResult = await this.columnRepository.findById(
        command.columnId,
      );

      if (columnResult.isErr()) {
        return err(columnResult.error);
      }

      const column = columnResult.value;

      if (column.isDeleted) {
        return err(new ColumnNotFoundDomainError(command.columnId.value));
      }

      column.changeBoard(new BoardIdVO(command.boardId.value));

      await this.columnRepository.save(column);

      return ok();
    } catch (error) {
      return err(error);
    }
  }
}
