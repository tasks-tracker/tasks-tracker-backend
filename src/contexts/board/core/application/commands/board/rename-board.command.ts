import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { BoardIdVO, BoardTitleVO, UserIdVO } from '../../../domain';

export class RenameBoardCommand extends Command<
  Result<BoardIdVO, DomainError>
> {
  constructor(
    public readonly boardId: BoardIdVO,
    public readonly newTitle: BoardTitleVO,
    public readonly userId: UserIdVO,
  ) {
    super();
  }
}
