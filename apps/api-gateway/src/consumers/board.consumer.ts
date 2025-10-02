import { Injectable, OnModuleInit } from '@nestjs/common';
import { BoardResponse, BoardService } from '../services';
import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';
import { Logger } from 'libs/logger';

@Injectable()
export class BoardConsumer implements OnModuleInit {
  private consumer: Consumer;
  public response: BoardResponse | null = null;

  constructor(
    private readonly kafka: Kafka,
    private readonly loggger: Logger,
    private readonly boardService: BoardService,
  ) {
    this.loggger.setContext(BoardConsumer.name);
  }

  public async onModuleInit() {
    this.consumer = this.kafka.consumer({ groupId: 'board-consumer-group' });

    await this.consumer.subscribe({
      topic: 'create-board-response',
      fromBeginning: false,
    });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async (message: EachMessagePayload) => {
        if (!message.message.value) {
          return await this.commitOffset(message);
        }

        switch (message.topic) {
          case 'create-board-response': {
            const event = JSON.parse(
              message.message.value.toString(),
            ) as BoardResponse;

            this.loggger.log(
              `Received response for request ${event.requestId}:`,
              event,
            );

            console.log('event', event, event.requestId);

            this.boardService.saveResponse(event.requestId, event);

            break;
          }

          default: {
            this.loggger.error(`Unknown topic: ${message.topic}`);
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
