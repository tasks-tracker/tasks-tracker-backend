import { Logger } from '@libs/logger';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import {
  Board,
  BoardIdVO,
  BoardTitleVO,
  FullBoardResponse,
  UserIdVO,
} from '../../domain';

interface BoardCacheData {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string; // В Redis храним как строку
  updatedAt: string; // В Redis храним как строку
  isDeleted: boolean;
}

@Injectable()
export class BoardCacheService {
  constructor(
    private readonly redis: Redis,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BoardCacheService.name);
  }

  async setBoard(board: Board): Promise<void> {
    try {
      const boardKey = `board:${board.id.value}`;
      const boardValue = JSON.stringify({
        id: board.id.value,
        title: board.title.value,
        ownerId: board.ownerId.value,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
        isDeleted: board.isDeleted,
      });
      await this.redis.set(boardKey, boardValue, 'EX', 60 * 60 * 24);
      this.logger.log(`Board ${board.id.value} set to cache`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getBoard(id: BoardIdVO): Promise<Board | null> {
    try {
      const boardKey = `board:${id.value}`;
      const boardValue = await this.redis.get(boardKey);
      if (!boardValue) return null;

      const boardData = JSON.parse(boardValue) as BoardCacheData;
      const board = new Board(
        new BoardIdVO(boardData.id),
        new BoardTitleVO(boardData.title),
        new UserIdVO(boardData.ownerId),
        new Date(boardData.createdAt),
        new Date(boardData.updatedAt),
        boardData.isDeleted,
      );

      this.logger.log(`Board ${id.value} get from cache`);
      return board;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async getBoardsByUserId(
    ownerId: UserIdVO,
  ): Promise<Pick<FullBoardResponse, 'board'>[]> {
    try {
      const pattern = `board:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        this.logger.log(`No boards found for user ${ownerId.value}`);
        return [];
      }

      const boardsData = await this.redis.mget(keys);
      const boards: Pick<FullBoardResponse, 'board'>['board'][] = [];

      for (const boardValue of boardsData) {
        if (!boardValue) continue;

        try {
          const boardData = JSON.parse(boardValue) as BoardCacheData;

          if (boardData.ownerId === ownerId.value) {
            boards.push({
              id: boardData.id,
              title: boardData.title,
              owner: boardData.ownerId,
              ownerId: boardData.ownerId,
              createdAt: boardData.createdAt,
              updatedAt: boardData.updatedAt,
              userId: boardData.ownerId,
            });
          }
        } catch (parseError) {
          this.logger.error(`Error parsing board data: ${parseError}`);
        }
      }

      this.logger.log(
        `Found ${boards.length} boards for user ${ownerId.value}`,
      );

      return boards.map((board) => ({
        board: board,
      }));
    } catch (error) {
      this.logger.error(error);
      return [];
    }
  }

  async deleteBoard(id: BoardIdVO): Promise<void> {
    try {
      const boardKey = `board:${id.value}`;
      await this.redis.del(boardKey);
      this.logger.log(`Board ${id.value} deleted from cache`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async updateBoard(board: Board): Promise<void> {
    try {
      const boardKey = `board:${board.id.value}`;
      const boardValue = JSON.stringify({
        id: board.id.value,
        title: board.title.value,
        ownerId: board.ownerId.value,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
        isDeleted: board.isDeleted,
      });
      await this.redis.set(boardKey, boardValue, 'EX', 60 * 60 * 24);
      this.logger.log(`Board ${board.id.value} updated in cache`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
