import { Injectable } from '@nestjs/common';
import { Logger } from 'libs/logger';
import { EventEmitter } from 'events';

export interface UserSettingsResponse {
  status: string;
  message: string;
  requestId: string;
  userInfo: Record<string, any>;
}

@Injectable()
export class UserSettingsService extends EventEmitter {
  private readonly logger = new Logger({ context: 'UserSettingsService' });
  private responses = new Map<string, UserSettingsResponse>();
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: UserSettingsResponse) => void;
      reject: (reason?: any) => void;
    }
  >();

  public saveResponse<T extends UserSettingsResponse>(
    requestId: string,
    response: T,
  ): void {
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

  public getResponse<T extends UserSettingsResponse>(
    requestId: string,
  ): T | null {
    const response = this.responses.get(requestId) as T;
    if (response) {
      this.logger.log(`Retrieved response for request ${requestId}:`, response);
      return response;
    }
    this.logger.log(`No response found for request ${requestId}`);
    return null;
  }

  public waitForResponse<T extends UserSettingsResponse>(
    requestId: string,
    timeout: number = 30000,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const existingResponse = this.responses.get(requestId) as T;
      if (existingResponse) {
        resolve(existingResponse);
        return;
      }

      this.pendingRequests.set(requestId, {
        resolve: (value) => resolve(value as T),
        reject,
      });

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
