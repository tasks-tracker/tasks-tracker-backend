import { UserIdVO } from '../value-objects';
import { Settings } from '../aggregates/user.aggregate';

export class UserSettingsUpdatedEvent {
  constructor(
    public readonly userId: UserIdVO,
    public readonly settings: Settings,
  ) {}
}
