import {
  Body,
  ConflictException,
  Controller,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Post, Inject, Get } from '@nestjs/common';
import { Response } from 'express';
import { RegisterUserByLoginDto } from './dtos/register-user-by-login.dto';
import { AuthService } from '../../services';
import {
  createTrackExecutionTimeInterceptor,
  createTrackStatusesInterceptor,
} from 'adapters/metrics-adapter';
import { ApiResponse } from '@nestjs/swagger';
import { ClientKafka } from '@nestjs/microservices';
import { UseInterceptors } from '@nestjs/common';
import { GetUserInfoResponseDto, LoginBodyDto } from './dtos';
import { SessionToken } from 'libs/session-token-decorator';
import { Logger } from 'libs/logger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    logger.setContext(AuthController.name);
  }

  @Post('register-by-login')
  @UseInterceptors(
    createTrackStatusesInterceptor('http_auth_register_by_login_statuses'),
  )
  @UseInterceptors(
    createTrackExecutionTimeInterceptor(
      'http_auth_register_by_login_duration_seconds',
    ),
  )
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'REGISTRATION_REQUEST_ACCEPTED',
  })
  public async registerByLogin(@Body() body: RegisterUserByLoginDto) {
    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('register-by-login', {
      ...body,
      requestId,
    });

    try {
      const response = await this.authService.waitForResponse(requestId, 30000);
      if (response.status === 'SUCCESS') {
        return {
          success: true,
          message: 'USER_REGISTERED_SUCCESSFULLY',
          status: 'SUCCESS',
        };
      }
      if (response.status === 'CONFLICT') {
        throw new ConflictException(response.message);
      }
      if (response.status === 'BAD_REQUEST') {
        throw new BadRequestException(response.message);
      }
      throw new Error(response.message);
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

  @Post('login')
  @UseInterceptors(createTrackStatusesInterceptor('http_auth_login_statuses'))
  @UseInterceptors(
    createTrackExecutionTimeInterceptor('http_auth_login_duration_seconds'),
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'USER_LOGGED_IN_SUCCESSFULLY',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'USER_NOT_FOUND || INVALID_PASSWORD || UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  login(@Body() body: LoginBodyDto, @Res() res: Response) {
    try {
      this.kafkaClient.emit('login', JSON.stringify(body));
      res
        .status(HttpStatus.ACCEPTED)
        .json({
          success: true,
          message: 'USER_LOGGED_IN_SUCCESSFULLY',
          status: 'OK',
        })
        .cookie('session-token', 'test', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 дней
          sameSite: 'lax',
        });
    } catch (error) {
      console.log('Login error:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'USER_NOT_FOUND || INVALID_PASSWORD || UNKNOWN_ERROR',
        status: 'BAD_REQUEST',
      });
    }
  }

  @Post('logout')
  @UseInterceptors(createTrackStatusesInterceptor('http_auth_logout_statuses'))
  @UseInterceptors(
    createTrackExecutionTimeInterceptor('http_auth_logout_duration_seconds'),
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'USER_LOGGED_OUT_SUCCESSFULLY',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'SESSION_TOKEN_NOT_FOUND || UNKNOWN_ERROR',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async logout(
    @SessionToken() sessionToken: string | null,
    @Res() res: Response,
  ) {
    if (!sessionToken) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'SESSION_TOKEN_NOT_FOUND',
        status: 'BAD_REQUEST',
      });
      return;
    }

    try {
      // Отправляем запрос на logout и ждем ответ
      await this.kafkaClient
        .send('logout', JSON.stringify(sessionToken))
        .toPromise();

      // Удаляем cookie из браузера
      res.clearCookie('session-token');
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'USER_LOGGED_OUT_SUCCESSFULLY',
        status: 'OK',
      });
    } catch (error) {
      console.log('Logout error:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'SESSION_TOKEN_NOT_FOUND || UNKNOWN_ERROR',
        status: 'BAD_REQUEST',
      });
    }
  }

  @Get('me')
  @UseInterceptors(createTrackStatusesInterceptor('http_auth_me_statuses'))
  @UseInterceptors(
    createTrackExecutionTimeInterceptor('http_auth_me_duration_seconds'),
  )
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'USER_DATA',
    type: GetUserInfoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'SESSION_TOKEN_NOT_FOUND',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'USER_INFO_NOT_FOUND',
  })
  me(@SessionToken() sessionToken: string | null, @Res() res: Response) {
    if (!sessionToken) {
      throw new UnauthorizedException('SESSION_TOKEN_NOT_FOUND');
    }
    this.kafkaClient.emit('me', JSON.stringify(sessionToken));
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'USER_INFO_REQUEST_ACCEPTED',
      status: 'PROCESSING',
    });
  }
}
