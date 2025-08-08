import { AuthHelper } from '@contexts/auth';
import {
  Body,
  Controller,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Post,
  Delete,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChangeTaskColumnBodyDto,
  ChangeTaskColumnResponseDto,
  ChangeTaskDescriptionBodyDto,
  ChangeTaskDescriptionResponseDto,
  ChangeTaskOrderBodyDto,
  ChangeTaskOrderResponseDto,
  ChangeTaskOwnerBodyDto,
  ChangeTaskOwnerResponseDto,
  CreateTaskBodyDto,
  CreateTaskResponseDto,
  GetTaskInfoByIdQueryDto,
  GetTaskInfoByIdResponseDto,
  RenameTaskBodyDto,
} from './dtos/create-task.dtos';
import { SessionToken } from '@libs/session-token-decorator';
import {
  ColumnIdVO,
  CreateTaskCommand,
  RemoveTaskCommand,
  RenameTaskCommand,
  TaskDescriptionVO,
  TaskIdVO,
  TaskOrderVO,
  TaskOwnerIdVO,
  TaskTitleVO,
  ChangeTaskColumnCommand,
  ChangeTaskDescriptionCommand,
  ChangeTaskOrderCommand,
  ChangeTaskOwnerCommand,
  GetTaskInfoByIdQuery,
} from '../core';
import { DeleteTaskBodyDto, DeleteTaskResponseDto } from './dtos';

@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authHelper: AuthHelper,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateTaskResponseDto,
    description: 'Task created successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async createTask(
    @Body() body: CreateTaskBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new CreateTaskCommand(
          new TaskTitleVO(body.title),
          new TaskDescriptionVO(body.description),
          new TaskOrderVO(body.order),
          new ColumnIdVO(body.columnId),
          new TaskOwnerIdVO(userId.value),
        ),
      );

      if (result.isOk()) return { id: result.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteTaskResponseDto,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async deleteTask(
    @Body() body: DeleteTaskBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new RemoveTaskCommand(new TaskIdVO(body.taskId)),
      );

      if (result.isOk()) return { id: result.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Put('rename')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: RenameTaskBodyDto,
    description: 'Task renamed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async renameTask(
    @Body() body: RenameTaskBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new RenameTaskCommand(
          new TaskIdVO(body.taskId),
          new TaskTitleVO(body.title),
        ),
      );

      if (result.isOk()) return { id: result.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Put('change-column')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangeTaskColumnResponseDto,
    description: 'Task column changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeTaskColumn(
    @Body() body: ChangeTaskColumnBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new ChangeTaskColumnCommand(
          new TaskIdVO(body.taskId),
          new ColumnIdVO(body.columnId),
        ),
      );

      if (result.isOk()) return { id: result.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Put('change-description')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangeTaskDescriptionResponseDto,
    description: 'Task description changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async changeTaskDescription(
    @Body() body: ChangeTaskDescriptionBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new ChangeTaskDescriptionCommand(
          new TaskIdVO(body.taskId),
          new TaskDescriptionVO(body.description),
        ),
      );

      if (result.isOk()) return { id: result.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Put('change-order')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangeTaskOrderResponseDto,
    description: 'Task order changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async changeTaskOrder(
    @Body() body: ChangeTaskOrderBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new ChangeTaskOrderCommand(
          new TaskIdVO(body.taskId),
          new TaskOrderVO(body.order),
        ),
      );

      if (result.isOk()) return { id: result.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Put('change-assignee')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangeTaskOwnerResponseDto,
    description: 'Task assignee changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeTaskAssignee(
    @Body() body: ChangeTaskOwnerBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new ChangeTaskOwnerCommand(
          new TaskIdVO(body.taskId),
          new TaskOwnerIdVO(userId.value),
        ),
      );

      if (result.isOk()) return { id: result.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Get('get-info-by-id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetTaskInfoByIdResponseDto,
    description: 'Task info retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async getTaskInfoById(
    @Query('taskId') taskId: GetTaskInfoByIdQueryDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.queryBus.execute(
        new GetTaskInfoByIdQuery(new TaskIdVO(taskId.id)),
      );

      if (result) return { id: result.id.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }
}
