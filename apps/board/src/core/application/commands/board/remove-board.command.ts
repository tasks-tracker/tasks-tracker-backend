import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';
import { BoardIdVO } from '../../../domain';

export class RemoveBoardCommand extends Command<Result<void, DomainError>> {
  constructor(public readonly boardId: BoardIdVO) {
    super();
  }
}
