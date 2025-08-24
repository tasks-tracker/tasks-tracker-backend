import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import {
  BoardIdVO,
  BoardOwnerIdVO,
} from '@contexts/board/core/domain/value-objects';

export class ChangeBoardOwnerCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly boardId: BoardIdVO,
    public readonly currentOwnerId: BoardOwnerIdVO,
    public readonly newOwnerId: BoardOwnerIdVO,
  ) {
    super();
  }
}
