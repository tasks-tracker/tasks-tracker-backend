import { Injectable } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetUserIdBySessionTokenQuery } from "../application";
import { SessionTokenVO } from "../domain";
import { UserIdVO } from "../domain";

@Injectable()
export class AuthHelper {
  constructor(
    public readonly queryBus: QueryBus,
  ) { }
  public async getUserIdByCookies(sessionToken?: string): Promise<UserIdVO | null> {
    if (!sessionToken) return null;
    try {
      const userId = await this.queryBus.execute(new GetUserIdBySessionTokenQuery(new SessionTokenVO(sessionToken)));
      return userId;
    } catch (err) {
      return null;
    }
  }
}
