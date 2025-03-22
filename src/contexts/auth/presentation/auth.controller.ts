import { Controller, Post, Body } from "@nestjs/common";
import { ConflictException, BadRequestException, UnprocessableEntityException } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { RegisterByLoginBodyDto } from "./dtos";
import { RegisterUserByLoginCommand } from "../application";
import { LoginVO, PasswordVO } from "../domain";
import { UserLoginAlreadyUsedDomainError } from "../domain";
import { ValidationException } from "../../../libs";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
  ) { }

  @Post('register-by-login')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'USER_REGISTERED_SUCCESSFULLY' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'LOGIN_ALREADY_USED' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'UNKNOWN_ERROR' })
  @ApiResponse({ status: HttpStatus.UNPROCESSABLE_ENTITY, description: 'Validation error' })
  async registerByLogin(@Body() body: RegisterByLoginBodyDto) {
    try {
      const result = await this.commandBus.execute(
        new RegisterUserByLoginCommand(new LoginVO(body.login), new PasswordVO(body.password))
      );
      if (result.isOk()) return { message: 'USER_REGISTERED_SUCCESSFULLY' };

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
}
