import { AuthController } from '../controllers';
import { AuthService, BoardService } from '../services';
import { BoardController } from '../controllers';
import {
  AuthHelper,
  GetUserIdBySessionTokenQueryHandler,
  GetUserInfoQueryHandler,
  UserQueryRepository,
  UserRepository,
  SessionRepository,
  UserQueryRepositoryImpl,
  SessionRepositoryImpl,
  UserRepositoryImpl,
} from 'apps/auth/src';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { AuthConsumer, BoardConsumer } from '../consumers';
import { Redis } from 'ioredis';
import { ClientKafka } from '@nestjs/microservices';

export const servicesProviders = [BoardService, AuthService];

export const controllersProviders = [BoardController, AuthController];

export const helpersProviders = [AuthHelper];

export const consumersProviders = [AuthConsumer, BoardConsumer];

export const queryHandlersProviders = [
  GetUserIdBySessionTokenQueryHandler,
  GetUserInfoQueryHandler,
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
