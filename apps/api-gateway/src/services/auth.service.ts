import { Injectable } from '@nestjs/common';
import { Logger } from 'libs/logger';

interface RegisterResponse {
  login: string;
  status: string;
  message: string;
  requestId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger({ context: 'AuthService' });
  private responses = new Map<string, RegisterResponse>();

  public saveResponse(requestId: string, response: RegisterResponse): void {
    this.logger.log(`Saving response for request ${requestId}:`, response);
    this.responses.set(requestId, response);

    setTimeout(
      () => {
        this.responses.delete(requestId);
        this.logger.log(
          `Deleted response for request ${requestId} after timeout`,
        );
      },
      5 * 60 * 1000,
    );
  }

  public getResponse(requestId: string): RegisterResponse | null {
    const response = this.responses.get(requestId);
    if (response) {
      this.logger.log(`Retrieved response for request ${requestId}:`, response);
      return response;
    }
    this.logger.log(`No response found for request ${requestId}`);
    return null;
  }

  deleteResponse(requestId: string): void {
    this.responses.delete(requestId);
    this.logger.log(`Deleted response for request ${requestId}`);
  }
}
