import type { TodoIdVO } from '../value-objects';

export class TodoNotCompletedEvent {
  constructor(public readonly id: TodoIdVO) {}
}
