import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateColumnCommand } from '../../commands';
import { ColumnRepository } from '../../../domain';
import { err, Result, ok } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

@CommandHandler(UpdateColumnCommand)
export class UpdateColumnCommandHandler
  implements ICommandHandler<UpdateColumnCommand>
{
  constructor(private readonly columnRepository: ColumnRepository) {}

  async execute(
    command: UpdateColumnCommand,
  ): Promise<Result<void, DomainError>> {
    try {
      const columnResult = await this.columnRepository.findById(
        command.columnId,
      );

      if (columnResult.isErr()) {
        return err(columnResult.error);
      }

      const column = columnResult.value;

      column.update({
        title: command.title,
        order: command.order,
        boardId: command.boardId,
        ownerId: command.ownerId,
        isDeleted: command.isDeleted,
        updatedAt: command.updatedAt,
        createdAt: command.createdAt,
      });

      await this.columnRepository.save(column);

      return ok();
    } catch (error) {
      return err(error);
    }
  }
}
