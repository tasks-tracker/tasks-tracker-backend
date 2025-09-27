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

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'board-group',
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
