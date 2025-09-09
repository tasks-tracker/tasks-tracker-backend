import { Module } from '@nestjs/common';
import { BoardController, ColumnController } from '../presentation';
import {
  commandHandlersProviders,
  consumersProviders,
  queryHandlersProviders,
  queryRepositoriesProviders,
  repositoriesProviders,
} from './module.providers';
import { TaskController } from '../presentation';

@Module({
  controllers: [BoardController, ColumnController, TaskController],
  providers: [
    ...commandHandlersProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ...queryHandlersProviders,
    ...consumersProviders,
  ],
})
export class BoardModule {}
