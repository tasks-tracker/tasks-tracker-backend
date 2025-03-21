import { Module } from '@nestjs/common';
import { ConfigAdapterModule } from './adapters';
import { CqrsAdapterModule } from './adapters';

@Module({
  imports: [
    ConfigAdapterModule,
    CqrsAdapterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
