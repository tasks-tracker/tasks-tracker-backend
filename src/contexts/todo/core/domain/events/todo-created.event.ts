import { TodoIdVO } from '../value-objects';

export class TodoCreatedEvent {
  constructor(public readonly todoId: TodoIdVO) { }
}
