import { UserIdVO } from '../value-objects';

export class UserCreatedEvent {
  constructor(public readonly userId: UserIdVO) {}
}
