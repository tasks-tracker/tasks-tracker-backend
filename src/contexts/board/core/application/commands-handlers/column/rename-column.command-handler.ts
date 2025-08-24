import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainError } from '@libs/domain-error';
import { err, ok, Result } from 'neverthrow';
import { ColumnNotFoundDomainError, ColumnRepository } from '../../../domain';
import { RenameColumnCommand } from '../../commands';

@CommandHandler(RenameColumnCommand)
export class RenameColumnCommandHandler
  implements ICommandHandler<RenameColumnCommand>
{
  constructor(private readonly columnRepository: ColumnRepository) {}

  async execute(
    command: RenameColumnCommand,
  ): Promise<Result<void, ColumnNotFoundDomainError>> {
    try {
      const columnResult = await this.columnRepository.findById(
        command.columnId,
      );

      if (columnResult.isErr()) {
        return err(new ColumnNotFoundDomainError(command.columnId.value));
      }

      const column = columnResult.value;

      if (column.isDeleted) {
        return err(new ColumnNotFoundDomainError(command.columnId.value));
      }

      column.rename(command.userId, command.newTitle);

      await this.columnRepository.save(column);

      return ok();
    } catch (e) {
      console.log(e);
      return err(new DomainError());
    }
  }
}
