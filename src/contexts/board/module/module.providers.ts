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
  UserRegisteredByLoginConsumer,
} from '../core';
import {
  GetBoardInfoByIdQueryHandler,
  FindBoardsByUserIdQueryHandler,
  ExistByTitleBoardQueryHandler,
  ExistByUserIdQueryHandler,
  GetTaskInfoByIdQueryHandler,
  GetColumnInfoByIdQueryHandler,
  GetFullBoardQueryHandler,
} from '../core';
import { BoardRepository, BoardRepositoryImpl } from '../core';
import { ColumnRepository, ColumnRepositoryImpl } from '../core';
import { TaskRepository, TaskRepositoryImpl } from '../core';
import { BoardQueryRepository, BoardQueryRepositoryImpl } from '../core';
import { ColumnQueryRepository, ColumnQueryRepositoryImpl } from '../core';
import { TaskQueryRepository, TaskQueryRepositoryImpl } from '../core';

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

export const consumersProviders = [UserRegisteredByLoginConsumer];

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
  GetFullBoardQueryHandler,
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
