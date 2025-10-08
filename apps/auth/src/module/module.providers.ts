import { AuthHelper } from '../helpers';
import { GetUserIdBySessionTokenQueryHandler } from '../core';
import { GetUserInfoQueryHandler } from '../core';
import { RegisterUserByLoginCommandHandler } from '../core';
import { LoginUserCommandHandler } from '../core';
import { LogoutSessionCommandHandler } from '../core';
import { CryptoPort } from '../core';
import { CryptoPortImpl } from '../core';
import { UserRepository } from '../core';
import { UserRepositoryImpl } from '../core';
import { SessionRepository } from '../core';
import { SessionRepositoryImpl } from '../core';
import { UserQueryRepository } from '../core';
import { UserQueryRepositoryImpl } from '../core';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { Redis } from 'ioredis';
import { ClientKafka } from '@nestjs/microservices';

export const helpersProviders = [AuthHelper];

export const queryHandlersProviders = [
  GetUserIdBySessionTokenQueryHandler,
  GetUserInfoQueryHandler,
];

export const commandHandlersProviders = [
  RegisterUserByLoginCommandHandler,
  LoginUserCommandHandler,
  LogoutSessionCommandHandler,
];

export const portsProviders = [
  {
    provide: CryptoPort,
    useClass: CryptoPortImpl,
  },
];

export const repositoriesProviders = [
  {
    provide: UserRepository,
    useFactory: (
      kafkaClient: ClientKafka,
      transactionHost: TransactionHost<TransactionalAdapterPgPromise>,
      redis: Redis,
    ) => {
      return new UserRepositoryImpl(kafkaClient, transactionHost, redis);
    },
    inject: [
      {
        token: 'KAFKA_SERVICE',
        optional: false,
      },
      TransactionHost,
      Redis,
    ],
  },
  {
    provide: SessionRepository,
    useClass: SessionRepositoryImpl,
  },
];

export const queryRepositoriesProviders = [
  {
    provide: UserQueryRepository,
    useClass: UserQueryRepositoryImpl,
  },
];
