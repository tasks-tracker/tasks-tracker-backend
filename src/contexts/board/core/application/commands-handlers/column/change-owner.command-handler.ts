import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeColumnOwnerCommand } from '../../commands';
import { ColumnNotFoundDomainError, ColumnRepository } from '../../../domain';
import { err, Result, ok } from 'neverthrow';
import { UserIdVO } from '@contexts/auth';

@CommandHandler(ChangeColumnOwnerCommand)
export class ChangeColumnOwnerCommandHandler
  implements ICommandHandler<ChangeColumnOwnerCommand>
{
  constructor(private readonly columnRepository: ColumnRepository) {}

  async execute(
    command: ChangeColumnOwnerCommand,
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

      column.changeCreator(new UserIdVO(command.ownerId.value));

      await this.columnRepository.save(column);

      return ok();
    } catch (e) {
      console.log(e);
      return err(new ColumnNotFoundDomainError(command.columnId.value));
    }
  }
}
