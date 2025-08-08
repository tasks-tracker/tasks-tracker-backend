import { Command } from '@nestjs/cqrs';
import {
  ColumnIdVO,
  TaskTitleVO,
  TaskDescriptionVO,
  TaskOrderVO,
} from '../../../domain';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { UserIdVO } from '@contexts/auth';

export class CreateTaskCommand extends Command<Result<void, DomainError>> {
  constructor(
    public readonly title: TaskTitleVO,
    public readonly description: TaskDescriptionVO,
    public readonly order: TaskOrderVO,
    public readonly columnId: ColumnIdVO,
    public readonly ownerId: UserIdVO,
  ) {
    super();
  }
}
