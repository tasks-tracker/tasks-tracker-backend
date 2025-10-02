import type { EachMessagePayload } from 'kafkajs';
import { CreateDefaultBoardCommand } from '../../application/commands';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Consumer, Kafka } from 'kafkajs';
import { UserIdVO } from '../../domain';
import { Logger } from 'libs/logger';

@Injectable()
export class UserRegisteredByLoginConsumer implements OnModuleInit {
  private consumer: Consumer;

  constructor(
    private readonly kafka: Kafka,
    private readonly commandBus: CommandBus,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(UserRegisteredByLoginConsumer.name);
  }

  public async onModuleInit(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'board-group' });
    await this.consumer.subscribe({
      topic: 'register-by-login',
      fromBeginning: true,
    });
    await this.consumer.run({
      autoCommit: false,
      eachMessage: async (message: EachMessagePayload) => {
        if (!message.message.value) {
          return await this.commitOffset(message);
        }
        const event = JSON.parse(message.message.value.toString()) as {
          id: string;
        };
        const result = await this.commandBus.execute(
          new CreateDefaultBoardCommand(new UserIdVO(event.id)),
        );
        if (result.isErr()) {
          this.logger.error(
            `Error creating default board for user ${event.id}: ${result.error.message}`,
          );
          return;
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
