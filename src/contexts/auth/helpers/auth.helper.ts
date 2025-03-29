import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserIdBySessionTokenQuery } from '../core';
import { SessionTokenVO } from '../core';
import { UserIdVO } from '../core';

@Injectable()
export class AuthHelper {
  constructor(public readonly queryBus: QueryBus) {}
  public async getUserIdByCookies(
    sessionToken?: string,
  ): Promise<UserIdVO | null> {
    if (!sessionToken) return null;
    try {
      const userId = await this.queryBus.execute(
        new GetUserIdBySessionTokenQuery(new SessionTokenVO(sessionToken)),
      );
      return userId;
    } catch {
      return null;
    }
  }
}
