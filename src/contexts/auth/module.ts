import { Module } from "@nestjs/common";
import { AuthController } from "./presentation/auth.controller";
import { RegisterUserByLoginCommandHandler } from "./application";
import { CryptoPort } from "./domain";
import { CryptoPortImpl } from "./infrastructure";
import { UserRepository } from "./domain";
import { UserRepositoryImpl } from "./infrastructure";

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    RegisterUserByLoginCommandHandler,
    {
      provide: CryptoPort,
      useClass: CryptoPortImpl,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
  ],
})
export class AuthModule { }
