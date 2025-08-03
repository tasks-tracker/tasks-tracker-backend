import { Command } from '@nestjs/cqrs';
import { Result } from 'neverthrow';
import { DomainError } from '@libs/domain-error';
import { BoardOwnerIdVO } from '@contexts/board/core/domain/value-objects';
import { Board } from '@contexts/board/core/domain/aggregates';

export interface DefaultBoardResponse {
  board: Board;
  columns: Array<{
    id: string;
    title: string;
    boardId: string;
    ownerId: string;
    tasks: Array<{
      id: string;
      title: string;
      description: string | null;
      order: number;
      columnId: string;
      createdAt: Date;
      updatedAt: Date;
      ownerId: string;
    }>;
  }>;
}

export class CreateDefaultBoardCommand extends Command<
  Result<DefaultBoardResponse, DomainError>
> {
  constructor(public readonly ownerId: BoardOwnerIdVO) {
    super();
  }
}
