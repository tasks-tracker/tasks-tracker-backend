import { CreateDefaultBoardCommand } from '@contexts/board';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Consumer, Kafka } from 'kafkajs';

@Injectable()
export class UserRegisteredByLoginConsumer implements OnModuleInit {
  private consumer: Consumer;

  constructor(
    private readonly kafka: Kafka,
    private readonly commandBus: CommandBus,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'board-group' });
    await this.consumer.subscribe({
      topic: 'UserRegisteredByLogin',
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value!.toString());
        await this.commandBus.execute(new CreateDefaultBoardCommand(event.id));
      },
    });
  }
}
