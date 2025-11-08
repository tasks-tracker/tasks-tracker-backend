import { Controller, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Logger } from 'libs/logger';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateUserAvatarDto } from './dtos/update-user-avatar.dto';
import { UpdateUserAvatarCommand } from '../application';
import { UserIdVO } from 'apps/auth/src';
import { AvatarUrlVO, UserNotFoundDomainError } from '../domain';
import { ValidationException } from 'libs/validation-exception';

@Controller()
export class UserSettingsController {
  constructor(
    private readonly logger: Logger,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @MessagePattern('update-user-avatar')
  async updateUserAvatar(@Payload() payload: UpdateUserAvatarDto) {
    try {
      const result = await this.commandBus.execute(
        new UpdateUserAvatarCommand(
          new UserIdVO(payload.userId),
          new AvatarUrlVO(payload.avatarUrl),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('update-user-avatar-response', {
          userId: payload.userId,
          status: 'SUCCESS',
          message: 'USER_AVATAR_UPDATED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;

      if (err instanceof UserNotFoundDomainError) {
        this.kafkaClient.emit('update-user-avatar-response', {
          userId: payload.userId,
          status: 'NOT_FOUND',
          message: 'USER_NOT_FOUND',
          requestId: payload.requestId,
        });
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('update-user-avatar-response', {
          userId: payload.userId,
          status: 'UNPROCESSABLE_ENTITY',
          message: 'VALIDATION_ERROR',
          requestId: payload.requestId,
        });
      }

      this.kafkaClient.emit('update-user-avatar-response', {
        userId: payload.userId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error updating user avatar', error: String(error) },
        'UserSettingsController',
      );
      this.kafkaClient.emit('update-user-avatar-response', {
        userId: payload.userId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
        requestId: payload.requestId,
      });
    }
  }
}
