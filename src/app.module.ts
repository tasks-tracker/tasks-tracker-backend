import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigAdapterModule } from './adapters';
import { CqrsAdapterModule } from './adapters';

@Module({
  imports: [
    ConfigAdapterModule,
    CqrsAdapterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
