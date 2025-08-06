import {
  ChangeBoardOwnerCommandHandler,
  ChangeColumnBoardCommandHandler,
  ChangeColumnOwnerCommandHandler,
  CreateBoardCommandHandler,
  CreateColumnCommandHandler,
  RemoveBoardCommandHandler,
  RemoveColumnCommandHandler,
  RenameBoardCommandHandler,
  RenameColumnCommandHandler,
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
import {
  BoardQueryRepository,
  ColumnQueryRepository,
} from './core/application/query-repositories';
import { ColumnRepository } from './core/domain/repositories/column.repository';
import { ColumnRepositoryImpl } from './core/infrastructure/repositories/column.repository';
import { GetColumnInfoByIdQueryHandler } from './core/application/queries-handlers/column/get-column-info-by-id.query-handler';
import { ColumnQueryRepositoryImpl } from './core/infrastructure/query-repositories/column.query-repository';

export const commandHandlersProviders = [
  CreateBoardCommandHandler,
  RemoveBoardCommandHandler,
  RenameBoardCommandHandler,
  ChangeBoardOwnerCommandHandler,
  CreateColumnCommandHandler,
  RemoveColumnCommandHandler,
  RenameColumnCommandHandler,
  ChangeColumnOwnerCommandHandler,
  ChangeColumnBoardCommandHandler,
];

export const repositoriesProviders = [
  {
    provide: BoardRepository,
    useClass: BoardRepositoryImpl,
  },
  {
    provide: ColumnRepository,
    useClass: ColumnRepositoryImpl,
  },
];

export const queryHandlersProviders = [
  GetBoardInfoByIdQueryHandler,
  FindBoardsByUserIdQueryHandler,
  ExistByTitleBoardQueryHandler,
  ExistByUserIdQueryHandler,
  GetColumnInfoByIdQueryHandler,
];

export const queryRepositoriesProviders = [
  {
    provide: BoardQueryRepository,
    useClass: BoardQueryRepositoryImpl,
  },
  {
    provide: ColumnQueryRepository,
    useClass: ColumnQueryRepositoryImpl,
  },
];
