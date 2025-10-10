import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Body,
  UnprocessableEntityException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Delete,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Logger } from 'libs/logger';
import { Post } from '@nestjs/common';
import {
  ChangeColumnBoardDto,
  ChangeColumnOwnerDto,
  ChangeOwnerDto,
  ChangeTaskAssigneeDto,
  ChangeTaskColumnDto,
  ChangeTaskDescriptionDto,
  CreateBoardDto,
  CreateBoardResponseDto,
  CreateTaskDto,
  DeleteTaskDto,
  GetBoardDto,
  GetColumnInfoDto,
  GetFullBoardBodyDto,
  GetTaskInfoDto,
  RemoveBoardDto,
  RemoveColumnDto,
  RenameBoardDto,
  RenameColumnDto,
  RenameTaskDto,
  TaskChangeOrderDto,
} from './dtos';
import { ValidationException } from 'libs/validation-exception';
import { BoardResponse, BoardService } from '../../services';
import { SessionToken } from 'libs/session-token-decorator';
import { AuthHelper } from 'apps/auth/src';
import { CreateColumnDto } from './dtos';

@ApiTags('Board')
@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly logger: Logger,
    private readonly authHelper: AuthHelper,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    logger.setContext(BoardController.name);
  }

  @Post('get-full-board')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Full board fetched successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async getDefaultBoard(
    @Query() query: GetFullBoardBodyDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('get-full-board', {
      ...query,
      userId: query.userId,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          ...result,
        };
      }

      if (result.status === 'NOT_FOUND') {
        throw new NotFoundException('BOARD_NOT_FOUND');
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
    }
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateBoardResponseDto,
    description: 'Board created successfully',
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
  async createBoard(
    @Body() body: CreateBoardDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('create-board', {
      ...body,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'BOARD_CREATED_SUCCESSFULLY',
          status: 'SUCCESS',
          id: result.boardId,
        };
      }
      if (result.status === 'CONFLICT') {
        throw new ConflictException(result.message);
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }

      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('change-owner')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board owner changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeOwner(
    @Body() body: ChangeOwnerDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);

    if (!userId) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('change-owner-board', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'BOARD_OWNER_CHANGED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'NOT_FOUND') {
        throw new NotFoundException('BOARD_NOT_FOUND');
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }

      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }

      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Delete('remove')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async removeBoard(
    @Body() body: RemoveBoardDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('remove-board', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'BOARD_REMOVED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }

      if (result.status === 'NOT_FOUND') {
        throw new NotFoundException('BOARD_NOT_FOUND');
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
    }
  }

  @Patch('rename-board')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board renamed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async renameBoard(
    @Body() body: RenameBoardDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('rename-board', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'BOARD_RENAMED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'NOT_FOUND') {
        throw new NotFoundException('BOARD_NOT_FOUND');
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Get('get-board')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board fetched successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async getBoard(
    @Query() query: GetBoardDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('get-board-info', {
      ...query,
      boardId: query.boardId,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'BOARD_INFO_FETCHED_SUCCESSFULLY',
          status: 'SUCCESS',
          board: result,
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('column/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Column created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async createColumn(
    @Body() body: CreateColumnDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('create-column', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'COLUMN_CREATED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('column/change-board')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Column board changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeColumnBoard(
    @Body() body: ChangeColumnBoardDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('change-column-board', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'COLUMN_BOARD_CHANGED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('column/change-owner')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Column owner changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeColumnOwner(
    @Body() body: ChangeColumnOwnerDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('change-column-owner', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'COLUMN_OWNER_CHANGED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Delete('column/remove')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Column removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async removeColumn(
    @Body() body: RemoveColumnDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('remove-column', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'COLUMN_REMOVED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('column/rename')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Column renamed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async renameColumn(
    @Body() body: RenameColumnDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('rename-column', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'COLUMN_RENAMED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );

      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Get('column/get-info')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Column info fetched successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async getColumnInfo(
    @Query() query: GetColumnInfoDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('get-column-info', {
      ...query,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'COLUMN_INFO_FETCHED_SUCCESSFULLY',
          status: 'SUCCESS',
          column: result,
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('task/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async createTask(
    @Body() body: CreateTaskDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('create-task', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_CREATED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }

      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Delete('task/delete')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async deleteTask(
    @Body() body: DeleteTaskDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('delete-task', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_DELETED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );

      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('task/rename')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task renamed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async renameTask(
    @Body() body: RenameTaskDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('rename-task', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_RENAMED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }

      if (result.status === 'NOT_FOUND') {
        throw new NotFoundException('TASK_NOT_FOUND');
      }

      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }

      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('task/change-column')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task column changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeTaskColumn(
    @Body() body: ChangeTaskColumnDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('change-task-column', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_COLUMN_CHANGED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }

      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('task/change-description')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task description changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeTaskDescription(
    @Body() body: ChangeTaskDescriptionDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('change-task-description', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_DESCRIPTION_CHANGED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
    }
  }
  catch(error) {
    this.logger.error(
      { message: 'Error waiting for response', error: String(error) },
      'BoardController',
    );
    if (error instanceof ValidationException) {
      throw new UnprocessableEntityException();
    }

    if (error instanceof ConflictException) {
      throw new ConflictException(error.message);
    }
    if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }

  @Post('task/change-order')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task order changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeTaskOrder(
    @Body() body: TaskChangeOrderDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('change-task-order', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_ORDER_CHANGED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );

      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('task/change-assignee')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task assignee changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async changeTaskAssignee(
    @Body() body: ChangeTaskAssigneeDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('change-task-assignee', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_ASSIGNEE_CHANGED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('task/get-info')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task info fetched successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  async getTaskInfo(
    @Body() body: GetTaskInfoDto,
    @SessionToken() sessionToken: string,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();

    this.kafkaClient.emit('get-task-info', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const result = await this.boardService.waitForResponse<BoardResponse>(
        requestId,
        30000,
      );

      if (result.status === 'SUCCESS') {
        return {
          message: 'TASK_INFO_FETCHED_SUCCESSFULLY',
          status: 'SUCCESS',
          task: result,
        };
      }

      if (result.status === 'BAD_REQUEST') {
        throw new BadRequestException(result.message);
      }
      throw new Error(result.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'BoardController',
      );
      if (error instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }

      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }
}
