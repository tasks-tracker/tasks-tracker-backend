import type { Response } from 'express';
import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { UnprocessableEntityException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UseInterceptors } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { RegisterByLoginBodyDto } from './dtos';
import { LoginBodyDto } from './dtos';
import { GetUserInfoResponseDto } from './dtos';
import { RegisterUserByLoginCommand } from '../core';
import { LoginUserCommand } from '../core';
import { LogoutSessionCommand } from '../core';
import { GetUserInfoQuery } from '../core';
import { LoginVO, PasswordVO, SessionTokenVO } from '../core';
import { UserLoginAlreadyUsedDomainError } from '../core';
import { InvalidPasswordDomainError } from '../core';
import { UserWithLoginNotExistDomainError } from '../core';
import { NotUsedSessionTokenDomainError } from '../core';
import { ValidationException } from '@libs/validation-exception';
import { SessionCookieConfig } from '@adapters/config-adapter';
import { AuthHelper } from '../helpers';
import { SessionToken } from '@libs/session-token-decorator';
import { createTrackStatusesInterceptor } from '@adapters/metrics-adapter';
import { createTrackExecutionTimeInterceptor } from '@adapters/metrics-adapter';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly sessionCookieConfig: SessionCookieConfig;
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authHelper: AuthHelper,
    private readonly queryBus: QueryBus,
    configService: ConfigService,
  ) {
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
    status: HttpStatus.CREATED,
    description: 'USER_REGISTERED_SUCCESSFULLY',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'LOGIN_ALREADY_USED',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'UNKNOWN_ERROR' })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation error',
  })
  async registerByLogin(@Body() body: RegisterByLoginBodyDto) {
    try {
      const result = await this.commandBus.execute(
        new RegisterUserByLoginCommand(
          new LoginVO(body.login),
          new PasswordVO(body.password),
        ),
      );
      if (result.isOk()) {
        return { message: 'USER_REGISTERED_SUCCESSFULLY' };
      }

      const err = result.error;
      if (err instanceof UserLoginAlreadyUsedDomainError) {
        throw new ConflictException('LOGIN_ALREADY_USED');
      }
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
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
  async login(@Body() body: LoginBodyDto, @Res() res: Response) {
    try {
      const result = await this.commandBus.execute(
        new LoginUserCommand(
          new LoginVO(body.login),
          new PasswordVO(body.password),
        ),
      );
      if (result.isOk()) {
        const sessionToken = result.value;
        res.cookie('session_token', sessionToken.value, {
          httpOnly: true,
          secure: this.sessionCookieConfig.secure,
          maxAge: this.sessionCookieConfig.maxAge,
        });
        res.send({ message: 'USER_LOGGED_IN_SUCCESSFULLY' });
        return;
      }

      const err = result.error;
      if (err instanceof UserWithLoginNotExistDomainError) {
        throw new BadRequestException('USER_NOT_FOUND');
      } else if (err instanceof InvalidPasswordDomainError) {
        throw new BadRequestException('INVALID_PASSWORD');
      }
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
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
      throw new BadRequestException('SESSION_TOKEN_NOT_FOUND');
    }
    try {
      const result = await this.commandBus.execute(
        new LogoutSessionCommand(new SessionTokenVO(sessionToken)),
      );
      if (result.isOk()) {
        res.clearCookie('session_token');
        res.send({ message: 'USER_LOGGED_OUT_SUCCESSFULLY' });
        return;
      }

      const err = result.error;
      if (err instanceof NotUsedSessionTokenDomainError) {
        throw new BadRequestException('SESSION_TOKEN_NOT_FOUND');
      }
      throw new BadRequestException('UNKNOWN_ERROR');
    } catch (err) {
      if (err instanceof ValidationException) {
        throw new UnprocessableEntityException();
      }
      throw err;
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
  async me(
    @SessionToken() sessionToken: string | null,
  ): Promise<GetUserInfoResponseDto> {
    if (!sessionToken) {
      throw new UnauthorizedException('SESSION_TOKEN_NOT_FOUND');
    }
    const userId = await this.authHelper.getUserIdBySessionToken(sessionToken);
    if (!userId) {
      throw new UnauthorizedException('SESSION_TOKEN_NOT_FOUND');
    }
    const userInfo = await this.queryBus.execute(new GetUserInfoQuery(userId));
    if (!userInfo) {
      throw new BadRequestException('USER_INFO_NOT_FOUND');
    }
    return userInfo;
  }
}
