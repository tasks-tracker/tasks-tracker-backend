import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { BoardIdVO } from '@contexts/board/core/domain/value-objects';

export class RemoveBoardCommand extends Command<Result<void, DomainError>> {
  constructor(public readonly boardId: BoardIdVO) {
    super();
  }
}
