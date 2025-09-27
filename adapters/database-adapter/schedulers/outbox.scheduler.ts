import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OutboxEventProcessor } from '../../kafka-adapter/processors';
import { Logger } from 'libs/logger';

@Injectable()
export class OutboxSchedulerService {
  constructor(
    private readonly eventProcessor: OutboxEventProcessor,
    private readonly logger: Logger,
  ) {
    logger.setContext(OutboxSchedulerService.name);
  }

  @Cron('*/5 * * * * *')
  public async processOutboxEvents(): Promise<void> {
    try {
      await this.eventProcessor.processEvents();
    } catch (error) {
      this.logger.error(`Error processing outbox events: ${error}`);
    }
  }
}
