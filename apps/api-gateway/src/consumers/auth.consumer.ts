import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from 'libs/logger';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { AuthService, RegisterResponse } from '../services/auth.service';
import { LoginResponse, LoginService } from '../services';

@Injectable()
export class AuthConsumer implements OnModuleInit {
  private consumer: Consumer;
  public registerByLoginResponse: RegisterResponse | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly loginService: LoginService,
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

    await this.consumer.subscribe({
      topic: 'login-response',
      fromBeginning: false,
    });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async (message: EachMessagePayload) => {
        if (!message.message.value) {
          return await this.commitOffset(message);
        }

        switch (message.topic) {
          case 'register-by-login-response': {
            const event = JSON.parse(
              message.message.value.toString(),
            ) as RegisterResponse;
            this.logger.log(
              `Received response for request ${event.requestId}:`,
              event,
            );
            this.authService.saveResponse(event.requestId, event);
            break;
          }
          case 'login-response': {
            const loginEvent = JSON.parse(
              message.message.value.toString(),
            ) as LoginResponse;
            this.logger.log(
              `Received response for request ${loginEvent.requestId}:`,
              loginEvent,
            );
            this.loginService.saveResponse(loginEvent.requestId, loginEvent);
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
