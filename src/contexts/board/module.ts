import { Module } from '@nestjs/common';
import { BoardController, ColumnController } from './presentation';
import {
  commandHandlersProviders,
  queryHandlersProviders,
  queryRepositoriesProviders,
  repositoriesProviders,
} from './module.providers';

@Module({
  controllers: [BoardController, ColumnController],
  providers: [
    ...commandHandlersProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ...queryHandlersProviders,
  ],
})
export class BoardModule {}
