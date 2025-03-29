import { TodoIdVO } from '@contexts/todo/domain/value-objects';

export class TodoCreatedEvent {
  constructor(public readonly todoId: TodoIdVO) {}
}
