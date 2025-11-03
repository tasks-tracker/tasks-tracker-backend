import { UserIdVO, AvatarUrlVO } from '../value-objects';

export class UserAvatarChangedEvent {
  constructor(
    public readonly userId: UserIdVO,
    public readonly avatarUrl: AvatarUrlVO,
  ) {}
}
