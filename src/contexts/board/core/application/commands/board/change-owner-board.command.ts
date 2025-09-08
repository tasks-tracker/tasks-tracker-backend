import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { BoardIdVO, UserIdVO } from '../../../domain';

export class ChangeBoardOwnerCommand extends Command<
  Result<void, DomainError>
> {
  constructor(
    public readonly boardId: BoardIdVO,
    public readonly currentOwnerId: UserIdVO,
    public readonly newOwnerId: UserIdVO,
  ) {
    super();
  }
}
