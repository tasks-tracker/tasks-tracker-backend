import { Controller, Post, Delete, Put, Get, Body, Query } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { UnprocessableEntityException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
// import { UseInterceptors } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidationException } from '@libs/validation-exception';
import { AuthHelper } from '@contexts/auth';
import { SessionToken } from '@libs/session-token-decorator';
import { CreateTodoCommand } from '../core';
import { DeleteTodoCommand } from '../core';
import { MarkTodoAsCompletedCommand } from '../core';
import { MarkTodoAsNotCompletedCommand } from '../core';
import { UpdateTodoCommand } from '../core';
import { TodoTitleVO } from '../core';
import { TodoDescriptionVO } from '../core';
import { TodoIdVO } from '../core';
import { TodoNotFoundDomainError } from '../core';
import { TodoNotOwnerExceptionDomainError } from '../core';
import { TodoAlreadyDeletedDomainError } from '../core';
import { TodoAlreadyCompletedDomainError } from '../core';
import { TodoAlreadyNotCompletedDomainError } from '../core';
import { GetPaginationTodoForUserQuery } from '../core';
import { GetPaginationTodoForUserLimit } from '../core';
import { GetPaginationTodoForUserOffset } from '../core';
import { GetPaginationTodoForUserResponse } from './dtos';
import { GetPaginationTodoForUserQueryDto } from './dtos';
import {
  CreateTodoBodyDto,
  CreateTodoResponseDto,
  MarkAsCompletedBodyDto,
  UpdateTodoBodyDto,
} from './dtos';
import { DeleteTodoByIdBodyDto } from './dtos';
import { UserIdVO } from '../core';
// import { createTrackStatusesInterceptor } from '@adapters/metrics-adapter';
// import { createTrackExecutionTimeInterceptor } from '@adapters/metrics-adapter';

@ApiTags('Todo')
@Controller('todo')
export class TodoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authHelper: AuthHelper,
  ) { }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateTodoResponseDto,
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
  async createTodo(
    @Body() body: CreateTodoBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');
    try {
      const result = await this.commandBus.execute(
        new CreateTodoCommand(
          new TodoTitleVO(body.title),
          new TodoDescriptionVO(body.description),
          new Date(body.deadline),
          userId as UserIdVO,
        ),
      );
      if (result.isOk()) return { id: result.value.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'TODO_ALREADY_DELETED',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'TODO_NOT_FOUND',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('delete-by-id')
  async deleteTodoById(
    @Body() body: DeleteTodoByIdBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');
    try {
      const result = await this.commandBus.execute(
        new DeleteTodoCommand(new TodoIdVO(body.todoId), userId as UserIdVO),
      );
      if (result.isOk()) return;
      const error = result.error;
      if (error instanceof TodoNotFoundDomainError) {
        throw new NotFoundException('TODO_NOT_FOUND');
      } else if (error instanceof TodoNotOwnerExceptionDomainError) {
        throw new ForbiddenException();
      } else if (error instanceof TodoAlreadyDeletedDomainError) {
        throw new ConflictException('TODO_ALREADY_DELETED');
      }
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'TODO_ALREADY_COMPLETED',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'TODO_NOT_FOUND',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('mark-as-completed')
  async markAsCompleted(
    @Body() body: MarkAsCompletedBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');
    try {
      const result = await this.commandBus.execute(
        new MarkTodoAsCompletedCommand(
          userId as UserIdVO,
          new TodoIdVO(body.todoId),
        ),
      );
      if (result.isOk()) return;
      const error = result.error;
      if (error instanceof TodoNotFoundDomainError) {
        throw new NotFoundException('TODO_NOT_FOUND');
      } else if (error instanceof TodoNotOwnerExceptionDomainError) {
        throw new ForbiddenException();
      } else if (error instanceof TodoAlreadyCompletedDomainError) {
        throw new ConflictException('TODO_ALREADY_COMPLETED');
      }
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'TODO_ALREADY_NOT_COMPLETED',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'TODO_NOT_FOUND',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('mark-as-not-completed')
  async markAsNotCompleted(
    @Body() body: MarkAsCompletedBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');
    try {
      const result = await this.commandBus.execute(
        new MarkTodoAsNotCompletedCommand(
          userId as UserIdVO,
          new TodoIdVO(body.todoId),
        ),
      );
      if (result.isOk()) return;
      const error = result.error;
      if (error instanceof TodoNotFoundDomainError) {
        throw new NotFoundException('TODO_NOT_FOUND');
      } else if (error instanceof TodoNotOwnerExceptionDomainError) {
        throw new ForbiddenException();
      } else if (error instanceof TodoAlreadyNotCompletedDomainError) {
        throw new ConflictException('TODO_ALREADY_NOT_COMPLETED');
      }
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'TODO_NOT_FOUND',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('update')
  async updateTodo(
    @Body() body: UpdateTodoBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');
    try {
      const fields: UpdateTodoCommand['fields'] = {};
      if (body.fields?.title) {
        fields.title = new TodoTitleVO(body.fields.title);
      }
      if (body.fields?.description === null || body.fields?.description) {
        fields.description = body.fields.description
          ? new TodoDescriptionVO(body.fields.description)
          : null;
      }
      if (body.fields?.deadline === null || body.fields?.deadline) {
        fields.deadline = body.fields.deadline
          ? new Date(body.fields.deadline)
          : null;
      }
      const result = await this.commandBus.execute(
        new UpdateTodoCommand(
          new TodoIdVO(body.todoId),
          userId as UserIdVO,
          fields,
        ),
      );
      if (result.isOk()) return;
      const error = result.error;
      if (error instanceof TodoNotFoundDomainError) {
        throw new NotFoundException('TODO_NOT_FOUND');
      } else if (error instanceof TodoNotOwnerExceptionDomainError) {
        throw new ForbiddenException();
      }
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: GetPaginationTodoForUserResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'UNAUTHORIZED',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  @Get('get-todos')
  async getPaginationTodoForUser(
    @SessionToken() sessionToken: string | null,
    @Query() query: GetPaginationTodoForUserQueryDto
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');
    try {
      const items = await this.queryBus.execute(
        new GetPaginationTodoForUserQuery(
          userId as UserIdVO,
          new GetPaginationTodoForUserLimit(parseInt(query.limit ?? '10')),
          new GetPaginationTodoForUserOffset(parseInt(query.offset ?? '0')),
        ),
      );
      return { items };
    } catch (err) {
      console.log(err)
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }
}
