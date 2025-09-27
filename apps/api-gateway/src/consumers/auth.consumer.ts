import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from 'libs/logger';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { AuthService } from '../services/auth.service';

export interface RegisterResponse {
  login: string;
  status: string;
  message: string;
  requestId: string;
}

@Injectable()
export class AuthConsumer implements OnModuleInit {
  private consumer: Consumer;
  public registerByLoginResponse: RegisterResponse | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly kafka: Kafka,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AuthConsumer.name);
  }

  public async onModuleInit() {
    this.consumer = this.kafka.consumer({ groupId: 'auth-consumer-group' });
    await this.consumer.subscribe({
      topic: 'register-by-login-response',
      fromBeginning: false,
    });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async (message: EachMessagePayload) => {
        if (!message.message.value) {
          return await this.commitOffset(message);
        }
        const event = JSON.parse(
          message.message.value.toString(),
        ) as RegisterResponse;

        this.logger.log(
          `Received response for request ${event.requestId}:`,
          event,
        );

        if (event) {
          this.saveResponse(event);
        }

        await this.commitOffset(message);
      },
    });
  }

  saveResponse(event: RegisterResponse) {
    return event;
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
