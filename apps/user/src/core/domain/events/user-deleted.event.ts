import { UserIdVO } from '../value-objects';

export class UserDeletedEvent {
  constructor(public readonly userId: UserIdVO) {}
}
