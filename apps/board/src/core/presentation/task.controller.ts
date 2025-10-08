import { Controller, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from 'libs/logger';
import {
  ChangeTaskAssigneeDto,
  ChangeTaskColumnDto,
  ChangeTaskDescriptionDto,
  ChangeTaskOrderDto,
  CreateTaskDto,
  DeleteTaskDto,
  GetTaskInfoDto,
  RenameTaskDto,
} from './dtos';
import {
  ChangeTaskColumnCommand,
  ChangeTaskDescriptionCommand,
  ChangeTaskOrderCommand,
  ChangeTaskOwnerCommand,
  CreateTaskCommand,
  GetTaskInfoByIdQuery,
  RemoveTaskCommand,
  RenameTaskCommand,
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

  @MessagePattern('rename-task')
  async renameTask(@Payload() payload: RenameTaskDto) {
    try {
      const result = await this.commandBus.execute(
        new RenameTaskCommand(
          new TaskIdVO(payload.taskId),
          new TaskTitleVO(payload.newTitle),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('rename-task-response', {
          taskId: payload.taskId,
          status: 'SUCCESS',
          message: 'TASK_RENAMED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof TaskNotFoundDomainError) {
        this.kafkaClient.emit('rename-task-response', {
          taskId: payload.taskId,
          status: 'NOT_FOUND',
          requestId: payload.requestId,
          message: 'TASK_NOT_FOUND',
        });
        return;
      }

      this.kafkaClient.emit('rename-task-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
      return;
    } catch (error) {
      this.logger.error(
        { message: 'Error renaming task', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('rename-task-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    }
  }

  @MessagePattern('change-task-column')
  async changeTaskColumn(@Payload() payload: ChangeTaskColumnDto) {
    try {
      const result = await this.commandBus.execute(
        new ChangeTaskColumnCommand(
          new TaskIdVO(payload.taskId),
          new ColumnIdVO(payload.columnId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('change-task-column-response', {
          taskId: payload.taskId,
          requestId: payload.requestId,
          status: 'SUCCESS',
          message: 'TASK_COLUMN_CHANGED_SUCCESSFULLY',
        });
        return;
      }

      this.kafkaClient.emit('change-task-column-response', {
        taskId: payload.taskId,
        requestId: payload.requestId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error changing task column', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('change-task-column-response', {
        taskId: payload.taskId,
        requestId: payload.requestId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('change-task-description')
  async changeTaskDescription(@Payload() payload: ChangeTaskDescriptionDto) {
    try {
      const result = await this.commandBus.execute(
        new ChangeTaskDescriptionCommand(
          new TaskIdVO(payload.taskId),
          new TaskDescriptionVO(payload.description),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('change-task-description-response', {
          taskId: payload.taskId,
          status: 'SUCCESS',
          message: 'TASK_DESCRIPTION_CHANGED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof TaskNotFoundDomainError) {
        this.kafkaClient.emit('change-task-description-response', {
          taskId: payload.taskId,
          status: 'NOT_FOUND',
          requestId: payload.requestId,
          message: 'TASK_NOT_FOUND',
        });
      }

      this.kafkaClient.emit('change-task-description-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error changing task description', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('change-task-description-response', {
        taskId: payload.taskId,
        requestId: payload.requestId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('change-task-order')
  async changeTaskOrder(@Payload() payload: ChangeTaskOrderDto) {
    try {
      const result = await this.commandBus.execute(
        new ChangeTaskOrderCommand(
          new TaskIdVO(payload.taskId),
          new TaskOrderVO(payload.order),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('change-task-order-response', {
          taskId: payload.taskId,
          status: 'SUCCESS',
          requestId: payload.requestId,
          message: 'TASK_ORDER_CHANGED_SUCCESSFULLY',
        });
        return;
      }

      this.kafkaClient.emit('change-task-order-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
        message: 'UNKNOWN_ERROR',
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error changing task order', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('change-task-order-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
        message: 'UNKNOWN_ERROR',
      });
    }
  }

  @MessagePattern('change-task-assignee')
  async changeTaskAssignee(@Payload() payload: ChangeTaskAssigneeDto) {
    try {
      const result = await this.commandBus.execute(
        new ChangeTaskOwnerCommand(
          new TaskIdVO(payload.taskId),
          new UserIdVO(payload.assigneeId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('change-task-assignee-response', {
          taskId: payload.taskId,
          status: 'SUCCESS',
          requestId: payload.requestId,
          message: 'TASK_ASSIGNEE_CHANGED_SUCCESSFULLY',
        });
        return;
      }

      this.kafkaClient.emit('change-task-assignee-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
        message: 'UNKNOWN_ERROR',
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error changing task assignee', error: String(error) },
        'TaskController',
      );
      this.kafkaClient.emit('change-task-assignee-response', {
        taskId: payload.taskId,
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
        message: 'UNKNOWN_ERROR',
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
