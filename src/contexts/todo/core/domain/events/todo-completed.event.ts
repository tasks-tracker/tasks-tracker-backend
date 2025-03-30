import type { TodoIdVO } from "../value-objects";

export class TodoCompletedEvent {
  constructor(public readonly id: TodoIdVO) { }
}
