import { AuthHelper } from '@contexts/auth';
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
  Get,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChangeOwnerBoardBodyDto,
  CreateBoardBodyDto,
  CreateBoardResponseDto,
  CreateDefaultBoardBodyDto,
  ExistByTitleQueryDto,
  ExistByUserIdQueryDto,
  FindByUserIdQueryDto,
  GetFullBoardQueryDto,
  RemoveBoardBodyDto,
  RenameBoardBodyDto,
} from './dtos';
import { SessionToken } from '@libs/session-token-decorator';
import {
  BoardIdVO,
  BoardIsNotFoundDomainError,
  BoardIsNotOwnerDomainError,
  UserIdVO,
  BoardTitleVO,
  ChangeBoardOwnerCommand,
  CreateBoardCommand,
  CreateDefaultBoardCommand,
  ExistByTitleBoardQuery,
  ExistByUserIdQuery,
  FindByUserIdQuery,
  GetFullBoardQuery,
  RemoveBoardCommand,
  RenameBoardCommand,
} from '../core';
import { ValidationException } from '@libs/validation-exception';

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
          new UserIdVO(userId.value),
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
    description: 'Board owner changed successfully',
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
          new UserIdVO(userId.value),
          new UserIdVO(body.newOwnerId),
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
    description: 'Board removed successfully',
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
        new RemoveBoardCommand(new BoardIdVO(body.boardId)),
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
    description: 'Board renamed successfully',
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

  @Get('exist-by-title')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board exists by title',
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
  async existByTitle(@Query() query: ExistByTitleQueryDto) {
    try {
      const result = await this.queryBus.execute(
        new ExistByTitleBoardQuery(new BoardTitleVO(query.title)),
      );
      return { exist: result };
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @Get('exist-by-user-id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Board exists by user ID',
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
  async existByUserId(@Query() query: ExistByUserIdQueryDto) {
    try {
      const result = await this.queryBus.execute(
        new ExistByUserIdQuery(query.userId),
      );
      return { exist: result };
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @Get('find-by-user-id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Boards found by user ID',
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
  async findByUserId(@Query() query: FindByUserIdQueryDto) {
    try {
      const result = await this.queryBus.execute(
        new FindByUserIdQuery(new UserIdVO(query.userId)),
      );
      return { boards: result };
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @Post('create-default-board')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Default board created successfully',
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
  async createDefaultBoard(
    @Body() body: CreateDefaultBoardBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new CreateDefaultBoardCommand(new UserIdVO(body.userId)),
      );

      if (result.isOk()) return;
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }

  @Get('get-full-board')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Full board',
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
  async getFullBoard(@Query() query: GetFullBoardQueryDto) {
    try {
      const result = await this.queryBus.execute(
        new GetFullBoardQuery(new UserIdVO(query.userId)),
      );
      return result;
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
    }
  }
}
