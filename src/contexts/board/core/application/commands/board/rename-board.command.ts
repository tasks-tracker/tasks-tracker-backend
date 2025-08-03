import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import {
  BoardIdVO,
  BoardTitleVO,
} from '@contexts/board/core/domain/value-objects';

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
