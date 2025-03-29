import type { TodoIdVO } from "../value-objects";

export class TodoDeletedEvent {
  constructor(public readonly id: TodoIdVO) { }
}
