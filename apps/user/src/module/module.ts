import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaConfig } from 'adapters/config-adapter';
import { KafkaModule } from 'adapters/kafka-adapter';
import { UserSettingsController } from '../core/presentation';
import {
  commandHandlersProviders,
  queryHandlersProviders,
} from './module.providers';
import { repositoriesProviders } from './module.providers';
import { consumersProviders } from './module.providers';
import { queryRepositoriesProviders } from 'apps/auth/src/module/module.providers';

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
            groupId: 'user-consumer-group',
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
  ],
  controllers: [UserSettingsController],
  providers: [
    ...commandHandlersProviders,
    ...queryHandlersProviders,
    ...queryRepositoriesProviders,
    ...repositoriesProviders,
    ...consumersProviders,
  ],
})
export class UserModule {}
