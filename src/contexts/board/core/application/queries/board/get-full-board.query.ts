import { Query } from '@nestjs/cqrs';
import { UserIdVO } from '@contexts/auth/core/domain/value-objects';
import { FullBoardResponse } from '@contexts/board/core/domain/interfaces';

export class GetFullBoardQuery extends Query<FullBoardResponse> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
