import type { TodoIdVO } from '../value-objects';

export class TodoUpdatedEvent {
  constructor(
    public readonly id: TodoIdVO,
    public readonly updatedFields: Array<string>,
  ) {}
}
