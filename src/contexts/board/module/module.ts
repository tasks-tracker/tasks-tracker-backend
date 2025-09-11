import { Global, Module } from '@nestjs/common';
import { BoardController, ColumnController } from '../presentation';
import {
  commandHandlersProviders,
  consumersProviders,
  queryHandlersProviders,
  queryRepositoriesProviders,
  repositoriesProviders,
} from './module.providers';
import { TaskController } from '../presentation';
import { CacheAdapterModule } from '@adapters/cache-adapter';
import { ConfigService } from '@nestjs/config';
import { CacheConfig } from '@adapters/config-adapter';
import { serviceProviders } from './module.providers';

@Global()
@Module({
  imports: [
    CacheAdapterModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<CacheConfig>('cache')!,
      inject: [ConfigService],
    }),
  ],
  controllers: [BoardController, ColumnController, TaskController],
  providers: [
    ...serviceProviders,
    ...commandHandlersProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
    ...queryHandlersProviders,
    ...consumersProviders,
  ],
})
export class BoardModule {}
