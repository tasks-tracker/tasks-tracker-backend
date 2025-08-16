import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateColumnCommand } from '../../commands';
import {
  Column,
  ColumnAlreadyExistDomainError,
  ColumnIdVO,
  ColumnRepository,
} from '../../../domain';
import { err, Result, ok } from 'neverthrow';
import { randomUUID } from 'crypto';

@CommandHandler(CreateColumnCommand)
export class CreateColumnCommandHandler
  implements ICommandHandler<CreateColumnCommand>
{
  constructor(private readonly columnRepository: ColumnRepository) {}

  async execute(
    command: CreateColumnCommand,
  ): Promise<Result<ColumnIdVO, ColumnAlreadyExistDomainError>> {
    try {
      const id = new ColumnIdVO(randomUUID());

      const newColumn = Column.create(
        id,
        command.title,
        command.order,
        command.boardId,
        new Date(),
        new Date(),
        command.ownerId,
      );

      await this.columnRepository.save(newColumn);

      newColumn.commit();
      return ok(newColumn.id);
    } catch (error) {
      return err(error);
    }
  }
}
