import type { BoardOwnerIdVO } from '../../value-objects';

export class BoardOwnerChangedEvent {
  constructor(readonly ownerId: BoardOwnerIdVO) {}
}
