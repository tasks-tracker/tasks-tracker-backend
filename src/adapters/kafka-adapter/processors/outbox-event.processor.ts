import { Injectable, Logger } from '@nestjs/common';
import { Producer } from 'kafkajs';
import { OutboxRepository } from '../../database-adapter/repositories';
import { OutboxSchema } from '../../database-adapter/schemas/outbox.schema';

@Injectable()
export class OutboxEventProcessor {
  private readonly logger = new Logger(OutboxEventProcessor.name);

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly kafkaProducer: Producer,
  ) {}

  public async processEvents(): Promise<void> {
    const events = await this.outboxRepository.getPendingEvents();

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  public async processEvent(event: OutboxSchema): Promise<void> {
    try {
      await this.outboxRepository.markAsProcessed(event);

      const eventData = JSON.parse(event.event_data) as Record<string, any>;

      await this.kafkaProducer.send({
        topic: `${event.aggregate_type}.${event.event_type}`,
        messages: [
          {
            key: event.aggregate_id,
            value: JSON.stringify(eventData),
          },
        ],
      });

      await this.outboxRepository.markAsProcessed(event);
      this.logger.log(`Event ${event.id} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing event ${event.id}: ${error}`);

      if (event.retry_count < 3) {
        await this.outboxRepository.incrementRetryCount(event);
      } else {
        await this.outboxRepository.markAsFailed(event, event.retry_count);
      }
    }
  }
}
