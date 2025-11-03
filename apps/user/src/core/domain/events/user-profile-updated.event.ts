import { UserIdVO } from '../value-objects';

export class UserProfileUpdatedEvent {
  constructor(public readonly userId: UserIdVO) {}
}
