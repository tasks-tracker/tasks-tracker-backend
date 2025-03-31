import { Module } from '@nestjs/common';
import { TodoController } from './presentation';
import { commandHandlersProviders } from './module.providers';
import { repositoriesProviders } from './module.providers';
import { queryHandlersProviders } from './module.providers';
import { queryRepositoriesProviders } from './module.providers';

@Module({
  controllers: [TodoController],
  providers: [
    ...commandHandlersProviders,
    ...repositoriesProviders,
    ...queryHandlersProviders,
    ...queryRepositoriesProviders,
  ],
})
export class TodoModule { }
