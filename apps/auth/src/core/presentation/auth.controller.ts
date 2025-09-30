import { ConflictException, Controller, Inject } from '@nestjs/common';
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
import { LoginDto, LogoutDto } from './dtos';

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
        this.kafkaClient.emit('register-by-login-response', {
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
      }

      if (err instanceof ValidationException) {
        this.kafkaClient.emit('register-by-login-response', {
          login: payload.login,
          requestId: payload.requestId,
          status: 'BAD_REQUEST',
          message: 'VALIDATION_ERROR',
        });
        return;
      }

      if (err instanceof ConflictException) {
        this.kafkaClient.emit('register-by-login-response', {
          login: payload.login,
          requestId: payload.requestId,
          status: 'CONFLICT',
          message: 'CONFLICT_ERROR',
        });
      }

      this.kafkaClient.emit('register-by-login-response', {
        login: payload.login,
        requestId: payload.requestId,
        status: 'BAD_REQUEST',
        message: 'UNKNOWN_ERROR',
      });
    } catch (error) {
      this.logger.error(
        { message: 'Error registering user by login', error: String(error) },
        'AuthController',
      );
      this.kafkaClient.emit('register-by-login-response', {
        login: payload.login,
        requestId: payload.requestId,
        status: 'BAD_REQUEST',
        message: 'VALIDATION_ERROR',
      });
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
        this.kafkaClient.emit('login-response', {
          sessionToken: sessionToken.value,
          message: 'USER_LOGGED_IN_SUCCESSFULLY',
          status: 'OK',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;
      if (err instanceof UserWithLoginNotExistDomainError) {
        this.kafkaClient.emit('login-response', {
          message: 'USER_NOT_FOUND',
          status: 'BAD_REQUEST',
          requestId: payload.requestId,
        });
        return;
      } else if (err instanceof InvalidPasswordDomainError) {
        this.kafkaClient.emit('login-response', {
          message: 'INVALID_PASSWORD',
          status: 'BAD_REQUEST',
          requestId: payload.requestId,
        });
        return;
      }
      this.kafkaClient.emit('login-response', {
        message: 'UNKNOWN_ERROR',
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
      });
      return;
    } catch (error) {
      if (error instanceof ValidationException) {
        this.kafkaClient.emit('login-response', {
          message: 'UNKNOWN_ERROR',
          status: 'BAD_REQUEST',
          requestId: payload.requestId,
        });
        return;
      }
      this.kafkaClient.emit('login-response', {
        message: 'UNKNOWN_ERROR',
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
      });
      return;
    }
  }

  @MessagePattern('logout')
  async logout(@Payload() payload: LogoutDto) {
    try {
      const result = await this.commandBus.execute(
        new LogoutSessionCommand(new SessionTokenVO(payload.sessionToken)),
      );

      if (result.isOk()) {
        this.kafkaClient.emit('logout-response', {
          message: 'USER_LOGGED_OUT_SUCCESSFULLY',
          status: 'OK',
          requestId: payload.requestId,
        });
        return;
      }

      const err = result.error;
      if (err instanceof NotUsedSessionTokenDomainError) {
        this.kafkaClient.emit('logout-response', {
          message: 'SESSION_TOKEN_NOT_FOUND',
          status: 'BAD_REQUEST',
          requestId: payload.requestId,
        });
        return;
      }
      this.kafkaClient.emit('logout-response', {
        message: 'UNKNOWN_ERROR',
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
      });
      return;
    } catch (err) {
      if (err instanceof ValidationException) {
        this.kafkaClient.emit('logout-response', {
          message: 'UNKNOWN_ERROR',
          status: 'BAD_REQUEST',
          requestId: payload.requestId,
        });
        return;
      }
      this.kafkaClient.emit('logout-response', {
        message: 'UNKNOWN_ERROR',
        status: 'BAD_REQUEST',
        requestId: payload.requestId,
      });
      return;
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
