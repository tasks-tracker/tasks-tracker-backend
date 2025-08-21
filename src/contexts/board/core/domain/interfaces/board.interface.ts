import { Board } from '@contexts/board/core';

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
