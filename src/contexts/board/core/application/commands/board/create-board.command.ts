import { BoardIdVO, UserIdVO, BoardTitleVO } from '../../../domain';
import { DomainError } from '@libs/domain-error';
import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';

export class CreateBoardCommand extends Command<
  Result<BoardIdVO, DomainError>
> {
  constructor(
    public readonly title: BoardTitleVO,
    public readonly ownerId: UserIdVO,
  ) {
    super();
  }
}
