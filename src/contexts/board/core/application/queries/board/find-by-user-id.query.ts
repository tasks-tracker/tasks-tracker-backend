import { Query } from '@nestjs/cqrs';
import { UserIdVO } from '../../../domain';
import { FullBoardResponse } from '../../../domain';

export class FindByUserIdQuery extends Query<
  Pick<FullBoardResponse, 'board'>['board'][]
> {
  constructor(public readonly userId: UserIdVO) {
    super();
  }
}
