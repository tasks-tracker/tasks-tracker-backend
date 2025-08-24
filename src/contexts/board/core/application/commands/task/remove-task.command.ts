import type { Result } from 'neverthrow';
import type { TaskIdVO } from '../../../domain';
import type { DomainError } from '@libs/domain-error';

import { Command } from '@nestjs/cqrs';

export class RemoveTaskCommand extends Command<Result<void, DomainError>> {
  constructor(public readonly taskId: TaskIdVO) {
    super();
  }
}
