import type { UserIdVO } from '../../value-objects';

export class BoardOwnerChangedEvent {
  constructor(readonly ownerId: UserIdVO) {}
}
