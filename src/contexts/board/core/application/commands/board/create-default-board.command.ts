import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { BoardOwnerIdVO } from '@contexts/board/core/domain/value-objects';

export class CreateDefaultBoardCommand extends Command<
  Result<null, DomainError>
> {
  constructor(public readonly ownerId: BoardOwnerIdVO) {
    super();
  }
}
