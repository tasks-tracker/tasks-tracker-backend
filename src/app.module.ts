import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigAdapterModule } from './adapters';

@Module({
  imports: [ConfigAdapterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
