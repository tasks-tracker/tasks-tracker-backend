import {
  ChangeBoardOwnerCommandHandler,
  CreateBoardCommandHandler,
  RemoveBoardCommandHandler,
  RenameBoardCommandHandler,
} from './core/application/commands-handlers';
import { BoardRepository } from './core/domain/repositories/board.repository';
import { BoardRepositoryImpl } from './core/infrastructure/repositories/board.repository';
import {
  GetBoardInfoByIdQueryHandler,
  FindBoardsByUserIdQueryHandler,
  ExistByTitleBoardQueryHandler,
  ExistByUserIdQueryHandler,
} from './core/application/queries-handlers';
import { BoardQueryRepositoryImpl } from './core/infrastructure/query-repositories/board.query-repository';
import { BoardQueryRepository } from './core/application/query-repositories';

export const commandHandlersProviders = [
  CreateBoardCommandHandler,
  RemoveBoardCommandHandler,
  RenameBoardCommandHandler,
  ChangeBoardOwnerCommandHandler,
];

export const repositoriesProviders = [
  {
    provide: BoardRepository,
    useClass: BoardRepositoryImpl,
  },
];

export const queryHandlersProviders = [
  GetBoardInfoByIdQueryHandler,
  FindBoardsByUserIdQueryHandler,
  ExistByTitleBoardQueryHandler,
  ExistByUserIdQueryHandler,
];

export const queryRepositoriesProviders = [
  {
    provide: BoardQueryRepository,
    useClass: BoardQueryRepositoryImpl,
  },
];
