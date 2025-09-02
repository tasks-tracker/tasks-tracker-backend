import { Query } from '@nestjs/cqrs';
import { UserIdVO } from '../../../domain';
import { FullBoardResponse } from '../../../domain';

export class GetFullBoardQuery extends Query<FullBoardResponse> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
