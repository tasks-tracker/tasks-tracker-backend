import { CreateTodoCommandHandler } from './core';
import { DeleteTodoCommandHandler } from './core';
import { MarkTodoAsCompletedCommand } from './core';
import { MarkTodoAsNotCompletedCommand } from './core';
import { UpdateTodoCommandHandler } from './core';
import { TodoRepository } from './core';
import { TodoRepositoryImpl } from './core';

export const commandHandlersProviders = [
  CreateTodoCommandHandler,
  DeleteTodoCommandHandler,
  MarkTodoAsCompletedCommand,
  MarkTodoAsNotCompletedCommand,
  UpdateTodoCommandHandler,
];

export const repositoriesProviders = [
  {
    provide: TodoRepository,
    useClass: TodoRepositoryImpl,
  },
];
