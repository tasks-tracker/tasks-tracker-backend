import { UserIdVO } from '../../value-objects';

export class ColumnChangeOwnerEvent {
  constructor(
    readonly id: UserIdVO,
    readonly ownerId: UserIdVO,
  ) {}
}
