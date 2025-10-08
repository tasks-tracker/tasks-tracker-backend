import { Command } from '@nestjs/cqrs';
import {
  BoardIdVO,
  ColumnIdVO,
  ColumnOrderVO,
  ColumnTitleVO,
  UserIdVO,
} from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export class CreateColumnCommand extends Command<
  Result<ColumnIdVO, DomainError>
> {
  constructor(
    public readonly title: ColumnTitleVO,
    public readonly order: ColumnOrderVO,
    public readonly boardId: BoardIdVO,
    public readonly ownerId: UserIdVO,
  ) {
    super();
  }
}
