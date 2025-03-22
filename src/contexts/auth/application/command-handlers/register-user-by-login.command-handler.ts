import type { ICommandHandler } from "@nestjs/cqrs";
import { CommandHandler } from "@nestjs/cqrs";
import { RegisterUserByLoginCommand } from "../commands";
import { User } from "../../domain";
import { CryptoPort } from "../../domain";
import { UserRepository } from "../../domain";
import { ok } from "neverthrow";

@CommandHandler(RegisterUserByLoginCommand)
export class RegisterUserByLoginCommandHandler
  implements ICommandHandler<RegisterUserByLoginCommand> {
  constructor(
    private readonly cryptoPort: CryptoPort,
    private readonly userRepository: UserRepository,
  ) { }
  async execute(command: RegisterUserByLoginCommand) {
    const passwordHash = await this.cryptoPort.hashPassword(command.password);
    const userId = this.userRepository.nextId();
    const user = User.registerByLogin(userId, command.login, passwordHash);
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isErr()) return saveResult;
    user.commit();
    return ok(null);
  }
}
