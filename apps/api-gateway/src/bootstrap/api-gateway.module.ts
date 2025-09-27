import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../controllers';
import { AuthConsumer } from '../consumers/auth.consumer';
import { LoggerModule } from 'libs/logger';
import {
  ConfigAdapterModule,
  KafkaConfig,
  LoggerConfig,
  MetricsConfig,
} from 'adapters/config-adapter';
import { MetricsModule } from 'adapters/metrics-adapter';
import { AuthService } from '../services/auth.service';
import { KafkaModule } from 'adapters/kafka-adapter';

@Module({
  imports: [
    ConfigAdapterModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MetricsModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<MetricsConfig>('metrics')!,
      inject: [ConfigService],
    }),
    KafkaModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<KafkaConfig>('kafka')!,
      inject: [ConfigService],
    }),
    LoggerModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) =>
        configService.get<LoggerConfig>('logger')!,
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'api-gateway-group',
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthConsumer],
})
export class ApiGatewayModule {}
