import {
  BoardIdVO,
  BoardOwnerIdVO,
  BoardTitleVO,
} from '@contexts/board/core/domain/value-objects';
import { DomainError } from '@libs/domain-error';
import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';

export class CreateBoardCommand extends Command<
  Result<BoardIdVO, DomainError>
> {
  constructor(
    public readonly title: BoardTitleVO,
    public readonly ownerId: BoardOwnerIdVO,
  ) {
    super();
  }
}
