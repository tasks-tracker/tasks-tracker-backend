import { Global, Module } from '@nestjs/common';
import {
  commandHandlersProviders,
  consumersProviders,
  queryHandlersProviders,
  queryRepositoriesProviders,
  repositoriesProviders,
} from './module.providers';
import { CacheAdapterModule } from 'adapters/cache-adapter';
import { ConfigService } from '@nestjs/config';
import { CacheConfig, KafkaConfig } from 'adapters/config-adapter';
import { serviceProviders } from './module.providers';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  BoardController,
  ColumnController,
  TaskController,
} from '../core/presentation';
import { KafkaModule } from 'adapters/kafka-adapter';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'board-consumer-group',
          },
        },
      },
    ]),
    CacheAdapterModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<CacheConfig>('cache')!,
      inject: [ConfigService],
    }),
    KafkaModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<KafkaConfig>('kafka')!,
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
