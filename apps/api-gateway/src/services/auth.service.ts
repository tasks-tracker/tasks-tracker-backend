import { Injectable } from '@nestjs/common';
import { Logger } from 'libs/logger';
import { EventEmitter } from 'events';

export interface RegisterResponse {
  login: string;
  status: string;
  message: string;
  requestId: string;
}

export interface LoginResponse {
  sessionToken?: string;
  status: string;
  message: string;
  requestId: string;
}

export interface LogoutResponse {
  status: string;
  message: string;
  requestId: string;
  sessionToken?: string;
}

export type AuthResponse = LoginResponse | LogoutResponse | RegisterResponse;

@Injectable()
export class AuthService extends EventEmitter {
  private readonly logger = new Logger({ context: 'AuthService' });
  private responses = new Map<string, AuthResponse>();
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: AuthResponse) => void;
      reject: (reason?: any) => void;
    }
  >();

  public saveResponse<T extends AuthResponse>(
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

  public getResponse<T extends AuthResponse>(requestId: string): T | null {
    const response = this.responses.get(requestId) as T;
    if (response) {
      this.logger.log(`Retrieved response for request ${requestId}:`, response);
      return response;
    }
    this.logger.log(`No response found for request ${requestId}`);
    return null;
  }

  public waitForResponse<T extends AuthResponse>(
    requestId: string,
    timeout: number = 30000,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const existingResponse = this.responses.get(requestId) as T;
      if (existingResponse) {
        resolve(existingResponse);
        return;
      }

      console.log('pendingRequests', this.pendingRequests, existingResponse);

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
