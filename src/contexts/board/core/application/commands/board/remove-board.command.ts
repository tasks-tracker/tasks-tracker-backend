import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { BoardIdVO } from '@contexts/board/core/domain/value-objects';
import { UserIdVO } from '@contexts/auth';

export class RemoveBoardCommand extends Command<
  Result<BoardIdVO, DomainError>
> {
  constructor(
    public readonly boardId: BoardIdVO,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
