import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheConfig } from '@adapters/config-adapter';
import { CacheAdapterModule } from '@adapters/cache-adapter';
import { AuthController } from './presentation/auth.controller';
import { RegisterUserByLoginCommandHandler } from './application';
import { LoginUserCommandHandler } from './application';
import { LogoutSessionCommandHandler } from './application';
import { GetUserIdBySessionTokenQueryHandler } from './application';
import { GetUserInfoQueryHandler } from './application';
import { CryptoPort } from './domain';
import { CryptoPortImpl } from './infrastructure';
import { UserRepository } from './domain';
import { UserRepositoryImpl } from './infrastructure';
import { SessionRepository } from './domain';
import { SessionRepositoryImpl } from './infrastructure';
import { UserQueryRepository } from './application';
import { UserQueryRepositoryImpl } from './infrastructure';
import { AuthHelper } from './helpers';

@Module({
  imports: [
    CacheAdapterModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<CacheConfig>('cache')!,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthHelper,
    GetUserIdBySessionTokenQueryHandler,
    GetUserInfoQueryHandler,
    RegisterUserByLoginCommandHandler,
    LoginUserCommandHandler,
    LogoutSessionCommandHandler,
    {
      provide: CryptoPort,
      useClass: CryptoPortImpl,
    },
    {
      provide: UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: SessionRepository,
      useClass: SessionRepositoryImpl,
    },
    {
      provide: UserQueryRepository,
      useClass: UserQueryRepositoryImpl,
    },
  ],
})
export class AuthModule { }
