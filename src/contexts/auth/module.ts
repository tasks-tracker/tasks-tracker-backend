import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheConfig } from '@adapters/config-adapter';
import { CacheAdapterModule } from '@adapters/cache-adapter';
import { AuthController } from './presentation/auth.controller';
import { helpersProviders } from './module.providers';
import { queryHandlersProviders } from './module.providers';
import { commandHandlersProviders } from './module.providers';
import { portsProviders } from './module.providers';
import { repositoriesProviders } from './module.providers';
import { queryRepositoriesProviders } from './module.providers';

@Module({
  imports: [
    CacheAdapterModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<CacheConfig>('cache')!,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...helpersProviders,
    ...queryHandlersProviders,
    ...commandHandlersProviders,
    ...portsProviders,
    ...repositoriesProviders,
    ...queryRepositoriesProviders,
  ],
})
export class AuthModule {}
