import {
  BadRequestException,
  ConflictException,
  Controller,
  Inject,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthHelper } from '../../helpers';
import { ConfigService } from '@nestjs/config';
import { SessionCookieConfig } from 'adapters/config-adapter';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterByLoginBodyDto } from './dtos/register-by-login.dto';
import { Logger } from 'libs/logger';
import { CommandBus } from '@nestjs/cqrs';
import {
  LoginUserCommand,
  LogoutSessionCommand,
  RegisterUserByLoginCommand,
} from '../application';
import {
  InvalidPasswordDomainError,
  LoginVO,
  NotUsedSessionTokenDomainError,
  PasswordVO,
  SessionTokenVO,
  UserLoginAlreadyUsedDomainError,
  UserWithLoginNotExistDomainError,
} from '../domain';
import { ValidationException } from 'libs/validation-exception';
import { LoginDto } from './dtos';

@Controller()
export class AuthController {
  private readonly sessionCookieConfig: SessionCookieConfig;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly authHelper: AuthHelper,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    this.logger.log('AuthController initialized', 'AuthController');
    this.sessionCookieConfig =
      configService.get<SessionCookieConfig>('session-cookie')!;
  }

  @MessagePattern('register-by-login')
  async registerByLogin(@Payload() payload: RegisterByLoginBodyDto) {
    try {
      const result = await this.commandBus.execute(
        new RegisterUserByLoginCommand(
          new LoginVO(payload.login),
          new PasswordVO(payload.password),
        ),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('register-by-login', {
          login: payload.login,
          status: 'SUCCESS',
          message: 'USER_REGISTERED_SUCCESSFULLY',
          requestId: payload.requestId,
        });
        return;
      }
      const err = result.error;
      if (err instanceof UserLoginAlreadyUsedDomainError) {
        this.kafkaClient.emit('register-by-login-response', {
          login: payload.login,
          requestId: payload.requestId,
          status: 'CONFLICT',
          message: 'LOGIN_ALREADY_USED',
        });
        return;
      } else {
        this.kafkaClient.emit('register-by-login-response', {
          login: payload.login,
          requestId: payload.requestId,
          status: 'BAD_REQUEST',
          message: 'UNKNOWN_ERROR',
        });
        return;
      }
    } catch (error) {
      if (error instanceof ValidationException) {
        this.kafkaClient.emit('register-by-login-response', {
          login: payload.login,
          requestId: payload.requestId,
          status: 'BAD_REQUEST',
          message: 'VALIDATION_ERROR',
        });
        return;
      }
      if (error instanceof ConflictException) {
        this.kafkaClient.emit('register-by-login-response', {
          login: payload.login,
          requestId: payload.requestId,
          status: 'BAD_REQUEST',
          message: 'CONFLICT_ERROR',
        });
        return;
      }
      this.logger.error(
        { message: 'Unknown error occurred', error: String(error) },
        'AuthController',
      );
      this.kafkaClient.emit('register-by-login-response', {
        login: payload.login,
        requestId: payload.requestId,
        status: 'BAD_REQUEST',
        message: 'INTERNAL_SERVER_ERROR',
      });
      return;
    }
  }

  @MessagePattern('login')
  async login(@Payload() payload: LoginDto) {
    try {
      const result = await this.commandBus.execute(
        new LoginUserCommand(
          new LoginVO(payload.login),
          new PasswordVO(payload.password),
        ),
      );

      if (result.isOk()) {
        const sessionToken = result.value;
        return {
          sessionToken: sessionToken.value,
          message: 'USER_LOGGED_IN_SUCCESSFULLY',
          status: 'OK',
        };
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

  @MessagePattern('logout')
  async logout(@Payload() payload: string) {
    try {
      const result = await this.commandBus.execute(
        new LogoutSessionCommand(new SessionTokenVO(payload)),
      );

      if (result.isOk()) {
        return {
          message: 'USER_LOGGED_OUT_SUCCESSFULLY',
          status: 'OK',
        };
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

  //   @MessagePattern('me')
  //   async me(@Payload() payload: string, @Res() res: Response) {
  //     try {
  //       const userId = this.authHelper.getUserIdBySessionToken(payload);

  //       if (!userId) {
  //         throw new UnauthorizedException('SESSION_TOKEN_NOT_FOUND');
  //       }
  //       const userInfo
  //     } catch (error) {}
  //   }
  // }
}
