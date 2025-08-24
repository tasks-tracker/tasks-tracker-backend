import { Board } from '@contexts/board/core';
import { TaskInterface } from './task.interface';

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
    order: number;
    isDeleted: boolean;
    creatorId: string;
    ownerId: string;
    tasks: TaskInterface[];
  }>;
}
