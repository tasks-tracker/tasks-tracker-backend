import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from 'libs/logger';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { UserSettingsResponse, UserSettingsService } from '../services';

@Injectable()
export class UserSettingsConsumer implements OnModuleInit {
  private consumer: Consumer;
  public response: UserSettingsResponse | null = null;

  constructor(
    private readonly userSettingsService: UserSettingsService,
    private readonly kafka: Kafka,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(UserSettingsConsumer.name);
  }

  public async onModuleInit() {
    this.consumer = this.kafka.consumer({
      groupId: 'user-settings-consumer-group',
    });

    await this.consumer.subscribe({
      topic: 'update-user-avatar-response',
      fromBeginning: false,
    });

    await this.consumer.subscribe({
      topic: 'get-user-settings-response',
      fromBeginning: false,
    });

    await this.consumer.subscribe({
      topic: 'update-user-settings-response',
      fromBeginning: false,
    });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async (message: EachMessagePayload) => {
        if (!message.message.value) {
          return await this.commitOffset(message);
        }

        switch (message.topic) {
          case 'update-user-settings-avatar-response': {
            const event = JSON.parse(
              message.message.value.toString(),
            ) as UserSettingsResponse;
            this.logger.log(
              `Received response for request ${event.requestId}:`,
              event,
            );
            this.userSettingsService.saveResponse(event.requestId, event);
            break;
          }

          case 'update-user-settings-response': {
            const event = JSON.parse(
              message.message.value.toString(),
            ) as UserSettingsResponse;
            this.logger.log(
              `Received response for request ${event.requestId}:`,
              event,
            );
            this.userSettingsService.saveResponse(event.requestId, event);
            break;
          }

          case 'get-user-settings-response': {
            const event = JSON.parse(
              message.message.value.toString(),
            ) as UserSettingsResponse;
            this.logger.log(
              `Received response for request ${event.requestId}:`,
              event,
            );

            this.userSettingsService.saveResponse(event.requestId, event);
            break;
          }

          default: {
            this.logger.error(`Unknown topic: ${message.topic}`);
            break;
          }
        }

        await this.commitOffset(message);
      },
    });
  }

  async commitOffset(message: EachMessagePayload): Promise<void> {
    return await this.consumer.commitOffsets([
      {
        topic: message.topic,
        partition: message.partition,
        offset: (Number(message.message.offset) + 1).toString(),
      },
    ]);
  }
}
