import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateColumnCommand } from '../../commands';
import {
  Column,
  ColumnAlreadyExistDomainError,
  ColumnIdVO,
  ColumnRepository,
} from '../../../domain';
import { err, Result, ok } from 'neverthrow';

@CommandHandler(CreateColumnCommand)
export class CreateColumnCommandHandler
  implements ICommandHandler<CreateColumnCommand>
{
  constructor(private readonly columnRepository: ColumnRepository) {}

  async execute(
    command: CreateColumnCommand,
  ): Promise<Result<void, ColumnAlreadyExistDomainError>> {
    try {
      const columnResult = await this.columnRepository.findById(command.id);

      if (columnResult.isOk() && !columnResult.value.isDeleted) {
        return err(new ColumnAlreadyExistDomainError(command.title.value));
      }

      const newColumn = Column.create(
        new ColumnIdVO(command.id.value),
        command.title,
        command.order,
        command.boardId,
        new Date(),
        new Date(),
        command.ownerId,
      );

      await this.columnRepository.save(newColumn);

      return ok();
    } catch (error) {
      return err(error);
    }
  }
}
