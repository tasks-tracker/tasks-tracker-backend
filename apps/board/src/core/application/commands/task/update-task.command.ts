import { Command } from '@nestjs/cqrs';
import {
  ColumnIdVO,
  TaskIdVO,
  TaskDescriptionVO,
  UserIdVO,
  TaskOrderVO,
  TaskTitleVO,
} from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export class UpdateTaskCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly taskId?: TaskIdVO,
    public readonly newTitle?: TaskTitleVO,
    public readonly newDescription?: TaskDescriptionVO,
    public readonly newOrder?: TaskOrderVO,
    public readonly newColumnId?: ColumnIdVO,
    public readonly newUserId?: UserIdVO,
  ) {
    super();
  }
}
