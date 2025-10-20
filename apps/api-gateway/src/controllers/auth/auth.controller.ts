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
import { AuthService, LoginResponse, MeResponse } from '../../services';
import {
  createTrackExecutionTimeInterceptor,
  createTrackStatusesInterceptor,
} from 'adapters/metrics-adapter';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientKafka } from '@nestjs/microservices';
import { UseInterceptors } from '@nestjs/common';
import { GetUserInfoResponseDto, LoginBodyDto } from './dtos';
import { SessionToken } from 'libs/session-token-decorator';
import { Logger } from 'libs/logger';
import { SessionCookieConfig } from 'adapters/config-adapter';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly sessionCookieConfig: SessionCookieConfig;
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    configService: ConfigService,
  ) {
    logger.setContext(AuthController.name);
    this.sessionCookieConfig =
      configService.get<SessionCookieConfig>('session-cookie')!;
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
  public async login(@Body() body: LoginBodyDto, @Res() res: Response) {
    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('login', {
      ...body,
      requestId,
    });

    try {
      const result = await this.authService.waitForResponse<LoginResponse>(
        requestId,
        30000,
      );

      this.logger.log('result', result, result.sessionToken);
      if (result.status === 'OK') {
        res.cookie('session-token', result.sessionToken, {
          httpOnly: true,
          secure: this.sessionCookieConfig.secure,
          maxAge: this.sessionCookieConfig.maxAge,
        });
        res.send({
          success: true,
          message: 'USER_LOGGED_IN_SUCCESSFULLY',
          status: 'OK',
        });

        return {
          success: true,
          message: 'USER_LOGGED_IN_SUCCESSFULLY',
          status: 'OK',
        };
      }

      throw new BadRequestException({
        message: result.message,
        status: result.status,
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for login response', error: String(error) },
        'AuthController',
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        message: 'LOGIN_TIMEOUT',
        status: 'TIMEOUT',
        requestId,
      };
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
    const requestId = crypto.randomUUID();
    this.kafkaClient.emit('logout', {
      sessionToken,
      requestId,
    });

    if (!sessionToken) {
      throw new BadRequestException('SESSION_TOKEN_NOT_FOUND');
    }

    try {
      const response = await this.authService.waitForResponse(requestId, 30000);

      if (response.status === 'OK') {
        res.clearCookie('session-token');
        res.status(HttpStatus.OK).json({
          success: true,
          message: 'USER_LOGGED_OUT_SUCCESSFULLY',
          status: 'OK',
        });
        return {
          success: true,
          message: 'USER_LOGGED_OUT_SUCCESSFULLY',
          status: 'OK',
        };
      }

      throw new BadRequestException({
        message: response.message,
        status: response.status,
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
  async me(@SessionToken() sessionToken: string | null, @Res() res: Response) {
    const requestId = crypto.randomUUID();

    if (!sessionToken) {
      throw new UnauthorizedException('SESSION_TOKEN_NOT_FOUND');
    }

    this.kafkaClient.emit('me', {
      sessionToken,
      requestId,
    });

    try {
      const response = await this.authService.waitForResponse<MeResponse>(
        requestId,
        30000,
      );

      console.log('response', response.status);

      if (response.status === 'OK') {
        res.status(HttpStatus.OK).json({
          success: true,
          message: 'USER_INFO_REQUEST_ACCEPTED',
          status: 'OK',
          userInfo: response.userInfo,
        });
        return {
          success: true,
          message: 'USER_INFO_REQUEST_ACCEPTED',
          status: 'OK',
        };
      }
      if (response.status === 'BAD_REQUEST') {
        throw new BadRequestException(response.message);
      }
      throw new Error(response.message);
    } catch (error) {
      this.logger.error(
        { message: 'Error waiting for me response', error: String(error) },
        'AuthController',
      );
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('UNKNOWN_ERROR');
    }
  }
}
