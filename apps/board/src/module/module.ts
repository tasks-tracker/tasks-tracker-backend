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
import { CacheConfig } from 'adapters/config-adapter';
import { serviceProviders } from './module.providers';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BoardController } from '../core/presentation';

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
  ],
  controllers: [BoardController],
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
