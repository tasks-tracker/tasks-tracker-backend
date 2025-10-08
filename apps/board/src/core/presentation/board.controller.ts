import { Controller, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from 'libs/logger';
import {
  ChangeBoardOwnerCommand,
  CreateBoardCommand,
  GetBoardInfoByIdQuery,
  RemoveBoardCommand,
  RenameBoardCommand,
} from '../application';
import {
  BoardAlreadyExistDomainError,
  BoardIdVO,
  BoardIsNotFoundDomainError,
  BoardTitleVO,
  UserIdVO,
} from '../domain';
import {
  ChangeOwnerDto,
  CreateBoardDto,
  GetBoardDto,
  RemoveBoardDto,
  RenameBoardDto,
} from './dtos';
import { ValidationException } from 'libs/validation-exception';

@Controller()
export class BoardController {
  constructor(
    private readonly logger: Logger,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}
  @MessagePattern('create-board')
  async createBoard(@Payload() payload: CreateBoardDto) {
    if (!payload.userId) {
      this.kafkaClient.emit('create-board-response', {
        boardTitle: payload.title,
        status: 'UNAUTHORIZED',
        message: 'UNAUTHORIZED',
        requestId: payload.requestId,
      });
      return;
    }

    try {
      const result = await this.commandBus.execute(
        new CreateBoardCommand(
          new BoardTitleVO(payload.title),
          new UserIdVO(payload.userId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('create-board-response', {
          boardId: result.value.value,
          status: 'SUCCESS',
          message: 'BOARD_CREATED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof BoardAlreadyExistDomainError) {
        this.kafkaClient.emit('create-board-response', {
          boardTitle: payload.title,
          status: 'CONFLICT',
          message: 'BOARD_ALREADY_EXISTS',
          requestId: payload.requestId,
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('create-board-response', {
          boardTitle: payload.title,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
        return;
      }

      this.kafkaClient.emit('create-board-response', {
        boardTitle: payload.title,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error creating board', error: String(error) },
        'BoardController',
      );
      this.kafkaClient.emit('create-board-response', {
        boardTitle: payload.title,
        status: 'BAD_REQUEST',
        message: 'VALIDATION_ERROR',
        requestId: payload.requestId,
      });
    }
  }

  @MessagePattern('change-owner-board')
  async changeOwner(@Payload() payload: ChangeOwnerDto) {
    try {
      const result = await this.commandBus.execute(
        new ChangeBoardOwnerCommand(
          new UserIdVO(payload.userId),
          new BoardIdVO(payload.boardId),
          new UserIdVO(payload.newOwnerId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('change-owner-board-response', {
          boardId: payload.boardId,
          status: 'SUCCESS',
          message: 'BOARD_OWNER_CHANGED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof BoardIsNotFoundDomainError) {
        this.kafkaClient.emit('change-owner-board-response', {
          boardId: payload.boardId,
          status: 'NOT_FOUND',
          message: 'BOARD_NOT_FOUND',
          requestId: payload.requestId,
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('change-owner-board-response', {
          boardId: payload.boardId,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
      }

      this.kafkaClient.emit('change-owner-board-response', {
        boardId: payload.boardId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error changing board owner', error: String(error) },
        'BoardController',
      );
      this.kafkaClient.emit('change-owner-board-response', {
        boardId: payload.boardId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    }
  }

  @MessagePattern('rename-board')
  async renameBoard(@Payload() payload: RenameBoardDto) {
    try {
      const result = await this.commandBus.execute(
        new RenameBoardCommand(
          new BoardIdVO(payload.boardId),
          new BoardTitleVO(payload.newTitle),
          new UserIdVO(payload.userId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('rename-board-response', {
          boardId: payload.boardId,
          status: 'SUCCESS',
          message: 'BOARD_RENAMED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof BoardIsNotFoundDomainError) {
        this.kafkaClient.emit('rename-board-response', {
          boardId: payload.boardId,
          status: 'NOT_FOUND',
          message: 'BOARD_NOT_FOUND',
          requestId: payload.requestId,
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('rename-board-response', {
          boardId: payload.boardId,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
        return;
      }

      this.kafkaClient.emit('rename-board-response', {
        boardId: payload.boardId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error renaming board', error: String(error) },
        'BoardController',
      );
      this.kafkaClient.emit('rename-board-response', {
        boardId: payload.boardId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    }
  }

  @MessagePattern('remove-board')
  async removeBoard(@Payload() payload: RemoveBoardDto) {
    try {
      const result = await this.commandBus.execute(
        new RemoveBoardCommand(new BoardIdVO(payload.boardId)),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('remove-board-response', {
          boardId: payload.boardId,
          status: 'SUCCESS',
          message: 'BOARD_REMOVED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof BoardIsNotFoundDomainError) {
        this.kafkaClient.emit('remove-board-response', {
          boardId: payload.boardId,
          status: 'NOT_FOUND',
          message: 'BOARD_NOT_FOUND',
          requestId: payload.requestId,
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('remove-board-response', {
          boardId: payload.boardId,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
      }

      this.kafkaClient.emit('remove-board-response', {
        boardId: payload.boardId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    } catch (error) {
      if (error instanceof ValidationException) {
        this.kafkaClient.emit('remove-board-response', {
          boardId: payload.boardId,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
      }

      this.logger.error(
        { message: 'Error removing board', error: String(error) },
        'BoardController',
      );
      this.kafkaClient.emit('remove-board-response', {
        boardId: payload.boardId,
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('get-board-info')
  async getBoard(@Payload() payload: GetBoardDto) {
    try {
      const result = await this.queryBus.execute(
        new GetBoardInfoByIdQuery(new BoardIdVO(payload.boardId)),
      );

      const board = {
        id: result.id.value,
        title: result.title.value,
        ownerId: result.ownerId.value,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      };

      if (result) {
        this.kafkaClient.emit('get-board-info-response', {
          status: 'SUCCESS',
          message: 'BOARD_INFO_FETCHED_SUCCESSFULLY',
          board,
          requestId: payload.requestId,
        });
        return;
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error getting board', error: String(error) },
        'BoardController',
      );
      this.kafkaClient.emit('get-board-info-response', {
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    }
  }
}
