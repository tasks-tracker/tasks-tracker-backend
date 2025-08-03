import { Module } from '@nestjs/common';
import { BoardController } from './presentation';
import {
  commandHandlersProviders,
  queryHandlersProviders,
  queryRepositoriesProviders,
  repositoriesProviders,
} from './module.providers';

@Module({
  controllers: [BoardController],
  providers: [
    ...commandHandlersProviders,
    ...repositoriesProviders,
    ...queryHandlersProviders,
    ...queryRepositoriesProviders,
  ],
})
export class BoardModule {}
