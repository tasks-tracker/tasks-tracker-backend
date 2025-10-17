import type { UserIdVO } from '../../value-objects';

export class BoardOwnerChangedEvent {
  constructor(readonly currentOwnerId: UserIdVO) {}
}
