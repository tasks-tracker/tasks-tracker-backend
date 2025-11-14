import {
  Body,
  ConflictException,
  Controller,
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
  Get,
  Query,
  Patch,
} from '@nestjs/common';
import { Post, Inject } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientKafka } from '@nestjs/microservices';
import { Logger } from 'libs/logger';
import { UserSettingsService } from '../../services';
import {
  GetUserSettingsRequestDto,
  UpdateUserAvatarRequestDto,
  UpdateUserSettingsRequestDto,
} from './dtos';
import { AuthHelper } from 'apps/auth/src/helpers';
import { SessionToken } from 'libs/session-token-decorator';

@ApiTags('User Settings')
@Controller('user-settings')
export class UserSettingsController {
  constructor(
    private readonly userSettingsService: UserSettingsService,
    private readonly logger: Logger,
    private readonly authHelper: AuthHelper,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    logger.setContext(UserSettingsController.name);
  }

  @Get('get-user-settings')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'USER_SETTINGS_FETCHED_SUCCESSFULLY',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  public async getUserSettings(
    @Query() query: GetUserSettingsRequestDto,
    @SessionToken() sessionToken: string,
  ) {
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('get-user-settings', {
      ...query,
      userId: userId.value,
      requestId,
    });

    try {
      const response = await this.userSettingsService.waitForResponse(
        requestId,
        30000,
      );
      return response;
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'UserSettingsController',
      );
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          message: error.message,
          status: 'BAD_REQUEST',
        });
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Post('update-user-avatar')
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'USER_AVATAR_UPDATED_SUCCESSFULLY',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'INVALID_AVATAR_URL || UNKNOWN_ERROR || TIMEOUT',
  })
  public async updateUserAvatar(
    @Body() body: UpdateUserAvatarRequestDto,
    @SessionToken() sessionToken: string,
  ) {
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('update-user-avatar', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const response = await this.userSettingsService.waitForResponse(
        requestId,
        30000,
      );
      return response;
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'AuthController',
      );
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          message: error.message,
          status: 'BAD_REQUEST',
        });
      }
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }

  @Patch('update-user-settings')
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'USER_SETTINGS_UPDATED_SUCCESSFULLY',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'UNKNOWN_ERROR',
  })
  public async updateUserSettings(
    @Body() body: UpdateUserSettingsRequestDto,
    @SessionToken() sessionToken: string,
  ) {
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) throw new UnauthorizedException('UNAUTHORIZED');

    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('update-user-settings', {
      ...body,
      userId: userId.value,
      requestId,
    });

    try {
      const response = await this.userSettingsService.waitForResponse(
        requestId,
        30000,
      );
      if (response.status === 'SUCCESS') {
        return {
          message: 'USER_SETTINGS_UPDATED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (response.status === 'BAD_REQUEST') {
        throw new BadRequestException(response.message);
      }
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for response', error: String(error) },
        'UserSettingsController',
      );
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException({
          message: error.message,
          status: 'BAD_REQUEST',
        });
      }
    }
  }
}
