import { Command } from '@nestjs/cqrs';
import { BoardIdVO, ColumnIdVO } from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export class ChangeColumnBoardCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly columnId: ColumnIdVO,
    public readonly boardId: BoardIdVO,
  ) {
    super();
  }
}
