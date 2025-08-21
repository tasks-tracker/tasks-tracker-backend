import {
  ChangeBoardOwnerCommandHandler,
  ChangeColumnBoardCommandHandler,
  ChangeColumnOwnerCommandHandler,
  ChangeTaskColumnCommandHandler,
  ChangeTaskDescriptionCommandHandler,
  ChangeTaskOrderCommandHandler,
  ChangeTaskOwnerCommandHandler,
  CreateBoardCommandHandler,
  CreateColumnCommandHandler,
  CreateDefaultBoardCommandHandler,
  CreateTaskCommandHandler,
  RemoveBoardCommandHandler,
  RemoveColumnCommandHandler,
  RemoveTaskCommandHandler,
  RenameBoardCommandHandler,
  RenameColumnCommandHandler,
  RenameTaskCommandHandler,
} from './core/application/commands-handlers';
import { BoardRepository } from './core/domain/repositories/board.repository';
import { BoardRepositoryImpl } from './core/infrastructure/repositories/board.repository';
import {
  GetBoardInfoByIdQueryHandler,
  FindBoardsByUserIdQueryHandler,
  ExistByTitleBoardQueryHandler,
  ExistByUserIdQueryHandler,
  GetTaskInfoByIdQueryHandler,
} from './core/application/queries-handlers';
import { BoardQueryRepositoryImpl } from './core/infrastructure/query-repositories/board.query-repository';
import {
  BoardQueryRepository,
  ColumnQueryRepository,
  TaskQueryRepository,
} from './core/application/query-repositories';
import { ColumnRepository } from './core/domain/repositories/column.repository';
import { ColumnRepositoryImpl } from './core/infrastructure/repositories/column.repository';
import { GetColumnInfoByIdQueryHandler } from './core/application/queries-handlers/column/get-column-info-by-id.query-handler';
import { ColumnQueryRepositoryImpl } from './core/infrastructure/query-repositories/column.query-repository';
import { TaskRepository } from './core/domain/repositories/task.repository';
import { TaskRepositoryImpl } from './core/infrastructure/repositories/task.repository';
import { TaskQueryRepositoryImpl } from './core/infrastructure/query-repositories/task.query-repository';

export const commandHandlersProviders = [
  CreateBoardCommandHandler,
  RemoveBoardCommandHandler,
  RenameBoardCommandHandler,
  ChangeBoardOwnerCommandHandler,
  CreateColumnCommandHandler,
  RemoveColumnCommandHandler,
  RenameColumnCommandHandler,
  ChangeColumnOwnerCommandHandler,
  CreateDefaultBoardCommandHandler,
  ChangeColumnBoardCommandHandler,
  CreateTaskCommandHandler,
  RemoveTaskCommandHandler,
  RenameTaskCommandHandler,
  ChangeTaskColumnCommandHandler,
  ChangeTaskDescriptionCommandHandler,
  ChangeTaskOrderCommandHandler,
  ChangeTaskOwnerCommandHandler,
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
  {
    provide: TaskRepository,
    useClass: TaskRepositoryImpl,
  },
];

export const queryHandlersProviders = [
  GetBoardInfoByIdQueryHandler,
  FindBoardsByUserIdQueryHandler,
  ExistByTitleBoardQueryHandler,
  ExistByUserIdQueryHandler,
  GetColumnInfoByIdQueryHandler,
  GetTaskInfoByIdQueryHandler,
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
  {
    provide: TaskQueryRepository,
    useClass: TaskQueryRepositoryImpl,
  },
];
