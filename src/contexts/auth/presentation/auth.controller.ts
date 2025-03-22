import type { Response } from "express";
import { Controller, Post, Body, Res } from "@nestjs/common";
import { ConflictException, BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpStatus } from "@nestjs/common";
import { HttpCode } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { RegisterByLoginBodyDto, LoginBodyDto } from "./dtos";
import { RegisterUserByLoginCommand, LoginUserCommand } from "../application";
import { LoginVO, PasswordVO } from "../domain";
import { UserLoginAlreadyUsedDomainError, InvalidPasswordDomainError, UserWithLoginNotExistDomainError } from "../domain";
import { ValidationException } from "../../../libs";
import { SessionCookieConfig } from "../../../adapters";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly sessionCookieConfig: SessionCookieConfig;
  constructor(
    private readonly commandBus: CommandBus,
    configService: ConfigService
  ) {
    this.sessionCookieConfig = configService.get<SessionCookieConfig>('session-cookie', { infer: true });
  }

  @Post('register-by-login')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'USER_REGISTERED_SUCCESSFULLY' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'LOGIN_ALREADY_USED' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'UNKNOWN_ERROR' })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'Validation error' })
  async registerByLogin(
    @Body() body: RegisterByLoginBodyDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.commandBus.execute(
        new RegisterUserByLoginCommand(new LoginVO(body.login), new PasswordVO(body.password))
      );
      if (result.isOk()) {
        const sessionToken = result.value;
        res.cookie('session_token', sessionToken, {
          httpOnly: true,
          secure: this.sessionCookieConfig.secure,
          maxAge: this.sessionCookieConfig.maxAge,
        });
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
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'USER_LOGGED_IN_SUCCESSFULLY' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'USER_NOT_FOUND || INVALID_PASSWORD || UNKNOWN_ERROR' })
  async login(
    @Body() body: LoginBodyDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.commandBus.execute(
        new LoginUserCommand(new LoginVO(body.login), new PasswordVO(body.password))
      )
      if (result.isOk()) {
        const sessionToken = result.value;
        res.cookie('session_token', sessionToken.value, {
          httpOnly: true,
          secure: this.sessionCookieConfig.secure,
          maxAge: this.sessionCookieConfig.maxAge,
        });
        res.send({ message: 'USER_LOGGED_IN_SUCCESSFULLY' });
        return;
      };

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
}
