import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheConfig, KafkaConfig } from 'adapters/config-adapter';
import { CacheAdapterModule } from 'adapters/cache-adapter';
import { helpersProviders } from './module.providers';
import { queryHandlersProviders } from './module.providers';
import { commandHandlersProviders } from './module.providers';
import { portsProviders } from './module.providers';
import { repositoriesProviders } from './module.providers';
import { queryRepositoriesProviders } from './module.providers';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from '../core/presentation';
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
            groupId: 'auth-consumer-group',
          },
        },
      },
    ]),
    KafkaModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<KafkaConfig>('kafka')!,
      inject: [ConfigService],
    }),
    CacheAdapterModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<CacheConfig>('cache')!,
      inject: [ConfigService],
    }),
  ],
  providers: [
    ...helpersProviders,
    ...queryHandlersProviders,
    ...commandHandlersProviders,
    ...portsProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
  ],
  controllers: [AuthController],
  exports: [
    ...helpersProviders,
    ...queryHandlersProviders,
    ...commandHandlersProviders,
    ...portsProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
  ],
})
export class AuthModule {}
