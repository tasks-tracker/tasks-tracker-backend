import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { Logger } from 'libs/logger';

export interface CreateBoardResponse {
  status: string;
  message: string;
  requestId: string;
  boardId: string;
}

export type BoardResponse = CreateBoardResponse;

@Injectable()
export class BoardService extends EventEmitter {
  private readonly logger = new Logger({ context: 'BoardService' });
  private responses = new Map<string, BoardResponse>();
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: BoardResponse) => void;
      reject: (reason?: any) => void;
    }
  >();

  public saveResponse<T extends BoardResponse>(requestId: string, response: T) {
    this.logger.log(
      `Saving Board response for request ${requestId}:`,
      response,
    );

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

  public getResponse<T extends BoardResponse>(requestId: string) {
    const response = this.responses.get(requestId) as T;
    if (response) {
      this.logger.log(`Retrieved response for request ${requestId}:`, response);
      return response;
    }
    this.logger.log(`No response found for request ${requestId}`);
    return null;
  }

  public waitForResponse<T extends BoardResponse>(
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

  public deleteResponse(requestId: string): void {
    this.responses.delete(requestId);
    this.logger.log(`Deleted response for request ${requestId}`);
  }
}
