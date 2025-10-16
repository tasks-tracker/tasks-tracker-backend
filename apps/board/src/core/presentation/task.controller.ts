import { Controller, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from 'libs/logger';
import {
  CreateTaskDto,
  DeleteTaskDto,
  GetTaskInfoDto,
  UpdateTaskDto,
} from './dtos';
import {
  CreateTaskCommand,
  GetTaskInfoByIdQuery,
  RemoveTaskCommand,
  UpdateTaskCommand,
} from '../application';
import {
  ColumnAlreadyExistDomainError,
  TaskIdVO,
  TaskNotFoundDomainError,
  TaskTitleVO,
} from '../domain';
import { TaskDescriptionVO } from '../domain';
import { TaskOrderVO } from '../domain';
import { ColumnIdVO } from '../domain';
import { UserIdVO } from 'apps/auth/src';

@Controller()
export class TaskController {
  constructor(
    private readonly logger: Logger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @MessagePattern('create-task')
  async createTask(@Payload() payload: CreateTaskDto) {
    try {
      const result = await this.commandBus.execute(
        new CreateTaskCommand(
          new TaskTitleVO(payload.title),
          new TaskDescriptionVO(payload.description),
          new TaskOrderVO(payload.order),
          new ColumnIdVO(payload.columnId),
          new UserIdVO(payload.userId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('create-task-response', {
          taskId: result.value,
          status: 'SUCCESS',
          message: 'TASK_CREATED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof ColumnAlreadyExistDomainError) {
        this.kafkaClient.emit('create-task-response', {
          taskId: payload.title,
          status: 'CONFLICT',
          message: 'COLUMN_NOT_FOUND',
          requestId: payload.requestId,
        });
        return;
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error creating task', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('create-task-response', {
        taskId: payload.title,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    }
  }

  @MessagePattern('delete-task')
  async deleteTask(@Payload() payload: DeleteTaskDto) {
    try {
      const result = await this.commandBus.execute(
        new RemoveTaskCommand(new TaskIdVO(payload.taskId)),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('delete-task-response', {
          taskId: payload.taskId,
          status: 'SUCCESS',
          requestId: payload.requestId,
          message: 'TASK_DELETED_SUCCESSFULLY',
        });
        return;
      }

      const err = result.error;

      if (err instanceof TaskNotFoundDomainError) {
        this.kafkaClient.emit('delete-task-response', {
          taskId: payload.taskId,
          status: 'NOT_FOUND',
          message: 'TASK_NOT_FOUND',
          requestId: payload.requestId,
        });
        return;
      }

      this.kafkaClient.emit('delete-task-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
        message: 'UNKNOWN_ERROR',
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error deleting task', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('delete-task-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
      return;
    }
  }

  @MessagePattern('update-task')
  async updateTask(@Payload() payload: UpdateTaskDto) {
    try {
      const { title, description, order, columnId, userId } = payload;
      const hasUpdatableFields =
        title !== undefined ||
        description !== undefined ||
        order !== undefined ||
        columnId !== undefined ||
        userId !== undefined;

      if (!hasUpdatableFields) {
        this.kafkaClient.emit('update-task-response', {
          taskId: payload.taskId,
          status: 'BAD_REQUEST',
          message: 'NO_DATA_TO_UPDATE',
          requestId: payload.requestId,
        });
        return;
      }

      const result = await this.commandBus.execute(
        new UpdateTaskCommand(
          new TaskIdVO(payload.taskId),
          title !== undefined ? new TaskTitleVO(title) : undefined,
          description !== undefined
            ? new TaskDescriptionVO(description)
            : undefined,
          order !== undefined ? new TaskOrderVO(order) : undefined,
          columnId !== undefined ? new ColumnIdVO(columnId) : undefined,
          userId !== undefined ? new UserIdVO(userId) : undefined,
        ),
      );

      this.logger.log(result);

      if (result.isOk()) {
        this.kafkaClient.emit('update-task-response', {
          taskId: payload.taskId,
          status: 'SUCCESS',
          message: 'TASK_UPDATED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      console.log(err);

      if (err instanceof TaskNotFoundDomainError) {
        this.kafkaClient.emit('update-task-response', {
          taskId: payload.taskId,
          status: 'NOT_FOUND',
          message: 'TASK_NOT_FOUND',
          requestId: payload.requestId,
        });
        return;
      }

      this.kafkaClient.emit('update-task-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
      return;
    } catch (error) {
      this.logger.error(
        { message: 'Error updating task', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('update-task-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    }
  }

  @MessagePattern('get-task-info')
  async getTaskInfo(@Payload() payload: GetTaskInfoDto) {
    try {
      const result = await this.queryBus.execute(
        new GetTaskInfoByIdQuery(new TaskIdVO(payload.taskId)),
      );

      if (result) {
        this.kafkaClient.emit('get-task-info-response', {
          taskId: payload.taskId,
          status: 'SUCCESS',
          message: 'TASK_INFO_FETCHED_SUCCESSFULLY',
          task: JSON.stringify(result),
          requestId: payload.requestId,
        });
        return;
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error getting task info', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('get-task-info-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requsetId: payload.requestId,
      });
    }
  }
}
