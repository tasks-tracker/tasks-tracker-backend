import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OutboxEventProcessor } from '../../kafka-adapter/processors';

@Injectable()
export class OutboxSchedulerService {
  private readonly logger = new Logger(OutboxSchedulerService.name);

  constructor(private readonly eventProcessor: OutboxEventProcessor) {}

  @Cron('*/5 * * * * *')
  public async processOutboxEvents(): Promise<void> {
    try {
      await this.eventProcessor.processEvents();
    } catch (error) {
      this.logger.error(`Error processing outbox events: ${error}`);
    }
  }
}
