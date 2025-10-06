import { Controller, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from 'libs/logger';
import {
  ChangeColumnBoardDto,
  ChangeColumnOwnerDto,
  CreateColumnDto,
  GetColumnInfoDto,
  RemoveColumnDto,
  RenameColumnDto,
} from './dtos';
import {
  ChangeColumnBoardCommand,
  ChangeColumnOwnerCommand,
  CreateColumnCommand,
  GetColumnInfoByIdQuery,
  RemoveColumnCommand,
  RenameColumnCommand,
} from '../application';
import {
  BoardIdVO,
  ColumnAlreadyExistDomainError,
  ColumnIdVO,
  ColumnOrderVO,
  ColumnTitleVO,
  UserIdVO,
} from '../domain';
import { ValidationException } from 'libs/validation-exception';

@Controller()
export class ColumnController {
  constructor(
    private readonly logger: Logger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @MessagePattern('create-column')
  async createColumn(@Payload() payload: CreateColumnDto) {
    try {
      const result = await this.commandBus.execute(
        new CreateColumnCommand(
          new ColumnTitleVO(payload.title),
          new ColumnOrderVO(payload.order),
          new BoardIdVO(payload.boardId),
          new UserIdVO(payload.ownerId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('create-column-response', {
          columnId: result.value.value,
          status: 'SUCCESS',
          message: 'COLUMN_CREATED_SUCCESSFULLY',
        });
        return;
      }

      const err = result.error;

      if (err instanceof ColumnAlreadyExistDomainError) {
        this.kafkaClient.emit('create-column-response', {
          columnId: payload.title,
          status: 'CONFLICT',
          message: 'COLUMN_ALREADY_EXISTS',
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('create-column-response', {
          columnId: payload.title,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
        });
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error creating column', error: String(error) },
        'ColumnController',
      );
      this.kafkaClient.emit('create-column-response', {
        columnId: payload.title,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('change-column-board')
  async changeColumnBoard(@Payload() payload: ChangeColumnBoardDto) {
    try {
      const result = await this.commandBus.execute(
        new ChangeColumnBoardCommand(
          new ColumnIdVO(payload.columnId),
          new BoardIdVO(payload.boardId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('change-column-board-response', {
          columnId: payload.columnId,
          status: 'SUCCESS',
          message: 'COLUMN_BOARD_CHANGED_SUCCESSFULLY',
        });
        return;
      }

      const err = result.error;

      if (err) {
        this.kafkaClient.emit('change-column-board-response', {
          columnId: payload.columnId,
          status: 'NOT_FOUND',
          message: 'UNKNOWN_ERROR',
        });
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error changing column board', error: String(error) },
        'ColumnController',
      );
    }
  }

  @MessagePattern('change-column-owner')
  async changeColumnOwner(@Payload() payload: ChangeColumnOwnerDto) {
    try {
      const result = await this.commandBus.execute(
        new ChangeColumnOwnerCommand(
          new ColumnIdVO(payload.columnId),
          new UserIdVO(payload.ownerId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('change-column-owner-response', {
          columnId: payload.columnId,
          status: 'SUCCESS',
          message: 'COLUMN_OWNER_CHANGED_SUCCESSFULLY',
        });
        return;
      }

      const err = result.error;

      if (err) {
        this.kafkaClient.emit('change-column-owner-response', {
          status: 'BAD_REQUEST',
          message: 'UNKNOWN_ERROR',
        });
      }
      this.kafkaClient.emit('change-column-owner-response', {
        columnId: payload.columnId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error changing column owner', error: String(error) },
        'ColumnController',
      );
      this.kafkaClient.emit('change-column-owner-response', {
        columnId: payload.columnId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('remove-column')
  async removeColumn(@Payload() payload: RemoveColumnDto) {
    try {
      const result = await this.commandBus.execute(
        new RemoveColumnCommand(new ColumnIdVO(payload.columnId)),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('remove-column-response', {
          columnId: payload.columnId,
          status: 'SUCCESS',
          message: 'COLUMN_REMOVED_SUCCESSFULLY',
        });
        return;
      }

      const err = result.error;

      if (err) {
        this.kafkaClient.emit('remove-column-response', {
          columnId: payload.columnId,
          status: 'BAD_REQUEST',
          message: 'COLUMN_NOT_FOUND',
        });
        return;
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error removing column', error: String(error) },
        'ColumnController',
      );
      this.kafkaClient.emit('remove-column-response', {
        columnId: payload.columnId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('rename-column')
  async renameColumn(@Payload() payload: RenameColumnDto) {
    try {
      const result = await this.commandBus.execute(
        new RenameColumnCommand(
          new ColumnIdVO(payload.columnId),
          new ColumnTitleVO(payload.newTitle),
          new UserIdVO(payload.userId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('rename-column-response', {
          columnId: payload.columnId,
          status: 'SUCCESS',
          message: 'COLUMN_RENAMED_SUCCESSFULLY',
        });
        return;
      }

      const err = result.error;

      if (err) {
        this.kafkaClient.emit('rename-column-response', {
          columnId: payload.columnId,
          status: 'BAD_REQUEST',
          message: 'UNKNOWN_ERROR',
        });
        return;
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error renaming column', error: String(error) },
        'ColumnController',
      );
      this.kafkaClient.emit('rename-column-response', {
        columnId: payload.columnId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('get-column-info')
  async getColumnInfo(@Payload() payload: GetColumnInfoDto) {
    try {
      const result = await this.queryBus.execute(
        new GetColumnInfoByIdQuery(new ColumnIdVO(payload.columnId)),
      );

      if (result) {
        this.kafkaClient.emit('get-column-info-response', {
          columnId: JSON.stringify(result),
          status: 'SUCCESS',
          message: 'COLUMN_INFO_RETRIEVED_SUCCESSFULLY',
        });
        return;
      }

      this.kafkaClient.emit('get-column-info-response', {
        columnId: JSON.stringify(result),
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error getting column info', error: String(error) },
        'ColumnController',
      );
      this.kafkaClient.emit('get-column-info-response', {
        columnId: payload.columnId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    }
  }
}
