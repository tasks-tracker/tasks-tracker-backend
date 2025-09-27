import { Injectable } from '@nestjs/common';
import { Logger } from 'libs/logger';
import { EventEmitter } from 'events';

export interface LoginResponse {
  sessionToken?: string;
  status: string;
  message: string;
  requestId: string;
}

@Injectable()
export class LoginService extends EventEmitter {
  private readonly logger = new Logger({ context: 'LoginService' });
  private responses = new Map<string, LoginResponse>();
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: LoginResponse) => void;
      reject: (reason?: any) => void;
    }
  >();

  public saveResponse(requestId: string, response: LoginResponse): void {
    this.logger.log(`Saving response for request ${requestId}:`, response);
    this.responses.set(requestId, response);

    const pendingRequest = this.pendingRequests.get(requestId);
    if (pendingRequest) {
      pendingRequest.resolve(response);
      this.pendingRequests.delete(requestId);
    }

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

  public getResponse(requestId: string): LoginResponse | null {
    const response = this.responses.get(requestId);
    if (response) {
      this.logger.log(`Retrieved response for request ${requestId}:`, response);
      return response;
    }
    this.logger.log(`No response found for request ${requestId}`);
    return null;
  }

  public waitForResponse(
    requestId: string,
    timeout: number = 30000,
  ): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      const existingResponse = this.responses.get(requestId);
      if (existingResponse) {
        resolve(existingResponse);
        return;
      }

      this.pendingRequests.set(requestId, { resolve, reject });

      setTimeout(() => {
        const pendingRequest = this.pendingRequests.get(requestId);
        if (pendingRequest) {
          pendingRequest.reject(
            new Error(`Timeout waiting for response ${requestId}`),
          );
          this.pendingRequests.delete(requestId);
        }
      }, timeout);
    });
  }

  deleteResponse(requestId: string): void {
    this.responses.delete(requestId);
    this.logger.log(`Deleted response for request ${requestId}`);
  }
}
