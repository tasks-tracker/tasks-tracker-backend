import type { IQueryHandler } from "@nestjs/cqrs";
import { QueryHandler } from "@nestjs/cqrs";
import { GetUserInfoQuery } from "../queries";
import { UserQueryRepository } from "../query-repositories";

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler
  implements IQueryHandler<GetUserInfoQuery, string> {
  constructor(
    public readonly userQueryRepository: UserQueryRepository,
  ) { }
  async execute(query: GetUserInfoQuery) {
    const userInfo = await this.userQueryRepository.getUserInfoById(query.userId);
    return userInfo;
  }
}
