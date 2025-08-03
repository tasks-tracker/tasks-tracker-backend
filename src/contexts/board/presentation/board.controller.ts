import { AuthHelper } from '@contexts/auth';
import { CreateTodoResponseDto } from '@contexts/todo/presentation/dtos';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Delete,
  UnauthorizedException,
  UnprocessableEntityException,
  Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChangeOwnerBoardBodyDto,
  CreateBoardBodyDto,
  RemoveBoardBodyDto,
  RenameBoardBodyDto,
} from './dtos';
import { SessionToken } from '@libs/session-token-decorator';
import {
  BoardIdVO,
  BoardIsNotFoundDomainError,
  BoardIsNotOwnerDomainError,
  BoardOwnerIdVO,
  BoardOwnerVO,
  BoardTitleVO,
  ChangeBoardOwnerCommand,
  CreateBoardCommand,
  RemoveBoardCommand,
  RenameBoardCommand,
} from '../core';
import { ValidationException } from '@libs/validation-exception';
import { UserIdVO } from '@contexts/todo/core';

@ApiTags('Board')
@Controller('board')
export class BoardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authHelper: AuthHelper,
  ) {}

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
  async createBoard(
    @Body() body: CreateBoardBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new CreateBoardCommand(
          new BoardTitleVO(body.title),
          new BoardOwnerIdVO(userId.value),
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

  @Post('change-owner')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
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
  async changeOwner(
    @Body() body: ChangeOwnerBoardBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new ChangeBoardOwnerCommand(
          new BoardIdVO(body.boardId),
          new BoardOwnerVO(userId.value),
          new BoardOwnerVO(body.newOwnerId),
        ),
      );
      if (result.isOk()) return;
      const error = result.error;
      if (error instanceof BoardIsNotFoundDomainError) {
        throw new NotFoundException('BOARD_NOT_FOUND');
      } else if (error instanceof BoardIsNotOwnerDomainError) {
        throw new ForbiddenException();
      }

      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
    }
  }

  @Delete('remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
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
  async removeBoard(
    @Body() body: RemoveBoardBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new RemoveBoardCommand(
          new BoardIdVO(body.boardId),
          new UserIdVO(userId.value),
        ),
      );

      if (result.isOk()) return;
      const error = result.error;
      if (error instanceof BoardIsNotFoundDomainError) {
        throw new NotFoundException('BOARD_NOT_FOUND');
      } else if (error instanceof BoardIsNotOwnerDomainError) {
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

  @Patch('rename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Success',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async renameBoard(
    @Body() body: RenameBoardBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new RenameBoardCommand(
          new BoardIdVO(body.boardId),
          new BoardTitleVO(body.newTitle),
          new UserIdVO(userId.value),
        ),
      );

      if (result.isOk()) return;
      const error = result.error;
      if (error instanceof BoardIsNotFoundDomainError) {
        throw new NotFoundException('BOARD_NOT_FOUND');
      } else if (error instanceof BoardIsNotOwnerDomainError) {
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
}
