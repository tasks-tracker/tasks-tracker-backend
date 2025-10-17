import { Controller, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from 'libs/logger';
import {
  CreateColumnDto,
  GetColumnInfoDto,
  RemoveColumnDto,
  UpdateColumnDto,
} from './dtos';
import {
  CreateColumnCommand,
  GetColumnInfoByIdQuery,
  RemoveColumnCommand,
  UpdateColumnCommand,
} from '../application';
import {
  BoardIdVO,
  ColumnAlreadyExistDomainError,
  ColumnIdVO,
  ColumnNotFoundDomainError,
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
          new UserIdVO(payload.userId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('create-column-response', {
          columnId: result.value.value,
          status: 'SUCCESS',
          message: 'COLUMN_CREATED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof ColumnAlreadyExistDomainError) {
        this.kafkaClient.emit('create-column-response', {
          columnId: payload.title,
          status: 'CONFLICT',
          message: 'COLUMN_ALREADY_EXISTS',
          requestId: payload.requestId,
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('create-column-response', {
          columnId: payload.title,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
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
        requestId: payload.requestId,
      });
    }
  }

  @MessagePattern('update-column')
  async updateColumn(@Payload() payload: UpdateColumnDto) {
    try {
      const hasUpdatableFields = Object.keys(payload).every(
        (key) => key !== undefined,
      );

      if (!hasUpdatableFields) {
        this.kafkaClient.emit('update-column-response', {
          columnId: payload.columnId,
          status: 'BAD_REQUEST',
          message: 'NO_DATA_TO_UPDATE',
          requestId: payload.requestId,
        });
        return;
      }

      const result = await this.commandBus.execute(
        new UpdateColumnCommand(
          new ColumnIdVO(payload.columnId),
          payload.title !== undefined
            ? new ColumnTitleVO(payload.title)
            : undefined,
          payload.order !== undefined
            ? new ColumnOrderVO(payload.order)
            : undefined,
          payload.boardId !== undefined
            ? new BoardIdVO(payload.boardId)
            : undefined,
          payload.ownerId !== undefined
            ? new UserIdVO(payload.ownerId)
            : undefined,
          payload.isDeleted !== undefined ? payload.isDeleted : undefined,
          payload.updatedAt !== undefined ? payload.updatedAt : undefined,
          payload.createdAt !== undefined ? payload.createdAt : undefined,
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('update-column-response', {
          columnId: payload.columnId,
          status: 'SUCCESS',
          message: 'COLUMN_UPDATED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof ColumnNotFoundDomainError) {
        this.kafkaClient.emit('update-column-response', {
          columnId: payload.columnId,
          status: 'NOT_FOUND',
          message: 'COLUMN_NOT_FOUND',
          requestId: payload.requestId,
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('update-column-response', {
          columnId: payload.columnId,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
      }

      if (err) {
        this.kafkaClient.emit('update-column-response', {
          columnId: payload.columnId,
          status: 'BAD_REQUEST',
          message: 'UNKNOWN_ERROR',
          requestId: payload.requestId,
        });
        return;
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error updating column', error: String(error) },
        'ColumnController',
      );
      this.kafkaClient.emit('update-column-response', {
        columnId: payload.columnId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
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
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err) {
        this.kafkaClient.emit('remove-column-response', {
          columnId: payload.columnId,
          status: 'BAD_REQUEST',
          message: 'COLUMN_NOT_FOUND',
          requestId: payload.requestId,
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
        requestId: payload.requestId,
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
          requestId: payload.requestId,
        });
        return;
      }

      this.kafkaClient.emit('get-column-info-response', {
        columnId: JSON.stringify(result),
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
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
        requestId: payload.requestId,
      });
    }
  }
}
