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

export class UpdateColumnCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly columnId: ColumnIdVO,
    public readonly title?: ColumnTitleVO,
    public readonly order?: ColumnOrderVO,
    public readonly boardId?: BoardIdVO,
    public readonly ownerId?: UserIdVO,
    public readonly isDeleted?: boolean,
    public readonly updatedAt?: Date,
    public readonly createdAt?: Date,
  ) {
    super();
  }
}
