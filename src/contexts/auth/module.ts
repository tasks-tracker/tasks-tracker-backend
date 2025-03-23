import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheConfig } from '../../adapters';
import { CacheAdapterModule } from '../../adapters';
import { AuthController } from './presentation/auth.controller';
import { RegisterUserByLoginCommandHandler } from './application';
import { LoginUserCommandHandler } from './application';
import { CryptoPort } from './domain';
import { CryptoPortImpl } from './infrastructure';
import { UserRepository } from './domain';
import { UserRepositoryImpl } from './infrastructure';
import { SessionRepository } from './domain';
import { SessionRepositoryImpl } from './infrastructure';

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
    RegisterUserByLoginCommandHandler,
    LoginUserCommandHandler,
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
  ],
})
export class AuthModule {}
