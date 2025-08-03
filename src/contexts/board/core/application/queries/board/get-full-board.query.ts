import { Query } from '@nestjs/cqrs';
import { UserIdVO } from '@contexts/auth/core/domain/value-objects';

export interface FullBoardResponse {
  board: {
    id: string;
    title: string;
    owner: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
  };
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
      createdAt: string;
      updatedAt: string;
      ownerId: string;
    }>;
  }>;
}

export class GetFullBoardQuery extends Query<FullBoardResponse> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
