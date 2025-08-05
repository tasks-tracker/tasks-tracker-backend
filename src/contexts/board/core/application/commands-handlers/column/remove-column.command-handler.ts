import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveColumnCommand } from '../../commands';
import { ColumnNotFoundDomainError, ColumnRepository } from '../../../domain';
import { err, ok, Result } from 'neverthrow';

@CommandHandler(RemoveColumnCommand)
export class RemoveColumnCommandHandler
  implements ICommandHandler<RemoveColumnCommand>
{
  constructor(public readonly columnRepository: ColumnRepository) {}

  async execute(
    command: RemoveColumnCommand,
  ): Promise<Result<void, ColumnNotFoundDomainError>> {
    try {
      const columnResult = await this.columnRepository.findById(
        command.columnId,
      );

      if (columnResult.isErr() || columnResult.value.isDeleted) {
        return err(new ColumnNotFoundDomainError(command.columnId.value));
      }

      await this.columnRepository.removeColumn(command.columnId);

      return ok(undefined);
    } catch (error) {
      return err(error);
    }
  }
}
