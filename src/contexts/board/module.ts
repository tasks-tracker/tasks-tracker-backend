import { Module } from '@nestjs/common';
import { BoardController, ColumnController } from './presentation';
import {
  commandHandlersProviders,
  queryHandlersProviders,
  queryRepositoriesProviders,
  repositoriesProviders,
} from './module.providers';
import { TaskController } from './presentation/task.controller';

@Module({
  controllers: [BoardController, ColumnController, TaskController],
  providers: [
    ...commandHandlersProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ...queryHandlersProviders,
  ],
})
export class BoardModule {}
