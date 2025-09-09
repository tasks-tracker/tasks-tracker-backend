import { AuthHelper, UserIdVO } from '@contexts/auth';
import { SessionToken } from '@libs/session-token-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ChangeColumnBoardBodyDto,
  ChangeColumnBoardResponseDto,
  ChangeColumnOwnerBodyDto,
  CreateColumnBodyDto,
  CreateColumnResponseDto,
  GetColumnInfoByIdQueryDto,
  GetColumnInfoByIdResponseDto,
  RemoveColumnBodyDto,
  RemoveColumnResponseDto,
  RenameColumnBodyDto,
} from './dtos';
import { CreateColumnCommand } from '../core';
import { BoardIdVO, ColumnIdVO, ColumnOrderVO, ColumnTitleVO } from '../core';
import { ChangeColumnBoardCommand } from '../core';
import { ChangeColumnOwnerCommand } from '../core';
import { RemoveColumnCommand } from '../core';
import { GetColumnInfoByIdQuery, RenameColumnCommand } from '../core';

@ApiTags('Column')
@Controller('column')
export class ColumnController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authHelper: AuthHelper,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateColumnResponseDto,
    description: 'Column created successfully',
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
  async createColumn(
    @Body() body: CreateColumnBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new CreateColumnCommand(
          new ColumnTitleVO(body.title),
          new ColumnOrderVO(body.order),
          new BoardIdVO(body.boardId),
          new UserIdVO(userId.value),
        ),
      );

      if (result.isOk()) return { id: result.value.value };
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Post('change-board')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangeColumnBoardResponseDto,
    description: 'Column board changed successfully',
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
  async changeColumnBoard(
    @Body() body: ChangeColumnBoardBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new ChangeColumnBoardCommand(
          new ColumnIdVO(body.columnId),
          new BoardIdVO(body.boardId),
        ),
      );
      if (result.isOk()) return;
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Post('change-owner')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ChangeColumnOwnerBodyDto,
    description: 'Column owner changed successfully',
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
  async changeColumnOwner(
    @Body() body: ChangeColumnOwnerBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new ChangeColumnOwnerCommand(
          new ColumnIdVO(body.columnId),
          new UserIdVO(userId.value),
        ),
      );
      if (result.isOk()) return;
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Delete('remove')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: RemoveColumnResponseDto,
    description: 'Column removed successfully',
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
  async removeColumn(
    @Body() body: RemoveColumnBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new RemoveColumnCommand(new ColumnIdVO(body.columnId)),
      );
      if (result.isOk()) return;
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
    type: RenameColumnBodyDto,
    description: 'Column renamed successfully',
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
  async renameColumn(
    @Body() body: RenameColumnBodyDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.commandBus.execute(
        new RenameColumnCommand(
          new ColumnIdVO(body.columnId),
          new ColumnTitleVO(body.newTitle),
          new UserIdVO(userId.value),
        ),
      );
      if (result.isOk()) return;
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }

  @Get('get-column-info-by-id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetColumnInfoByIdResponseDto,
    description: 'Column info retrieved successfully',
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
  async getColumnInfoById(
    @Query() query: GetColumnInfoByIdQueryDto,
    @SessionToken() sessionToken: string | null,
  ) {
    if (!sessionToken) throw new UnauthorizedException('UNAUTHORIZED');
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    try {
      const result = await this.queryBus.execute(
        new GetColumnInfoByIdQuery(new ColumnIdVO(query.columnId)),
      );

      if (result) return result;
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (error) {
      console.error(error);
      throw new BadRequestException('UNKNOWN_ERROR');
    }
  }
}
