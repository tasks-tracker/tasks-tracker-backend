import { CreateTodoCommandHandler } from './core';
import { DeleteTodoCommandHandler } from './core';
import { MarkTodoAsCompletedCommandHandler } from './core';
import { MarkTodoAsNotCompletedCommandHandler } from './core';
import { UpdateTodoCommandHandler } from './core';
import { GetPaginationTodoForUserQueryHandler } from './core';
import { TodoRepository } from './core';
import { TodoRepositoryImpl } from './core';
import { TodoQueryRepository } from './core';
import { TodoQueryRepositoryImpl } from './core';

export const commandHandlersProviders = [
  CreateTodoCommandHandler,
  DeleteTodoCommandHandler,
  MarkTodoAsCompletedCommandHandler,
  MarkTodoAsNotCompletedCommandHandler,
  UpdateTodoCommandHandler,
];

export const repositoriesProviders = [
  {
    provide: TodoRepository,
    useClass: TodoRepositoryImpl,
  },
];

export const queryHandlersProviders = [GetPaginationTodoForUserQueryHandler];

export const queryRepositoriesProviders = [
  {
    provide: TodoQueryRepository,
    useClass: TodoQueryRepositoryImpl,
  },
];
