import { Controller, Inject, UnauthorizedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from 'libs/logger';
import { CreateBoardCommand } from '../application';
import {
  BoardAlreadyExistDomainError,
  BoardTitleVO,
  UserIdVO,
} from '../domain';
import { CreateBoardDto } from './dtos';
import { ValidationException } from 'libs/validation-exception';

@Controller()
export class BoardController {
  constructor(
    private readonly logger: Logger,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}
  @MessagePattern('create-board')
  async createBoard(@Payload() payload: CreateBoardDto) {
    if (!payload.userId) {
      throw new UnauthorizedException('UNAUTHARIZED');
    }

    try {
      const result = await this.commandBus.execute(
        new CreateBoardCommand(
          new BoardTitleVO(payload.title),
          new UserIdVO(payload.userId),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('create-board-response', {
          boardId: result.value.value,
          status: 'SUCCESS',
          message: 'BOARD_CREATED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof BoardAlreadyExistDomainError) {
        this.kafkaClient.emit('create-board-response', {
          boardTitle: payload.title,
          status: 'CONFLICT',
          message: 'BOARD_ALREADY_EXISTS',
          requestId: payload.requestId,
        });
        return;
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('create-board-response', {
          boardTitle: payload.title,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
        return;
      }

      this.kafkaClient.emit('create-board-response', {
        boardTitle: payload.title,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error creating board', error: String(error) },
        'BoardController',
      );
      this.kafkaClient.emit('create-board-response', {
        boardTitle: payload.title,
        status: 'BAD_REQUEST',
        message: 'VALIDATION_ERROR',
        requestId: payload.requestId,
      });
    }
  }
}
