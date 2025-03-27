import { AuthHelper } from "./helpers"
import { GetUserIdBySessionTokenQueryHandler } from "./application"
import { GetUserInfoQueryHandler } from "./application"
import { RegisterUserByLoginCommandHandler } from "./application"
import { LoginUserCommandHandler } from "./application"
import { LogoutSessionCommandHandler } from "./application"
import { CryptoPort } from "./domain"
import { CryptoPortImpl } from "./infrastructure"
import { UserRepository } from "./domain"
import { UserRepositoryImpl } from "./infrastructure"
import { SessionRepository } from "./domain"
import { SessionRepositoryImpl } from "./infrastructure"
import { UserQueryRepository } from "./application"
import { UserQueryRepositoryImpl } from "./infrastructure"

export const helpersProviders = [AuthHelper]

export const queryHandlersProviders = [
  GetUserIdBySessionTokenQueryHandler,
  GetUserInfoQueryHandler,
]

export const commandHandlersProviders = [
  RegisterUserByLoginCommandHandler,
  LoginUserCommandHandler,
  LogoutSessionCommandHandler,
]

export const portsProviders = [
  {
    provide: CryptoPort,
    useClass: CryptoPortImpl,
  },
]

export const repositoriesProviders = [
  {
    provide: UserRepository,
    useClass: UserRepositoryImpl,
  },
  {
    provide: SessionRepository,
    useClass: SessionRepositoryImpl,
  },
]

export const queryRepositoriesProviders = [
  {
    provide: UserQueryRepository,
    useClass: UserQueryRepositoryImpl,
  }
]
