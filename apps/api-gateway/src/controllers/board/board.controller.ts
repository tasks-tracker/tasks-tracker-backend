import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Body,
  UnprocessableEntityException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Logger } from 'libs/logger';
import { Post } from '@nestjs/common';
import { CreateBoardDto, CreateBoardResponseDto } from './dtos';
import { ValidationException } from 'libs/validation-exception';
import { BoardService, CreateBoardResponse } from '../../services';

@ApiTags('Board')
@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly logger: Logger,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    logger.setContext(BoardController.name);
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
  async createBoard(@Body() body: CreateBoardDto) {
    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('create-board', {
      ...body,
      requestId,
    });

    try {
      const result =
        await this.boardService.waitForResponse<CreateBoardResponse>(
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
}
