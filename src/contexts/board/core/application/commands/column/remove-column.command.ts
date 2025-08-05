import type { Result } from 'neverthrow';
import type { ColumnIdVO } from '../../../domain';
import type { DomainError } from '@libs/domain-error';

import { Command } from '@nestjs/cqrs';

export class RemoveColumnCommand extends Command<Result<void, DomainError>> {
  constructor(public readonly columnId: ColumnIdVO) {
    super();
  }
}
