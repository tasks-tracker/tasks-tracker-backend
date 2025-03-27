import { AggregateRoot } from '@nestjs/cqrs';
import { TodoIdVO } from '@contexts/todo/domain/value-objects';
import { TodoTitleVO } from '@contexts/todo/domain/value-objects';
import { TodoDescriptionVO } from '@contexts/todo/domain/value-objects';
import { TodoCreatedEvent } from '@contexts/todo/domain/events/todo-created.event';
import { TodoUpdatedEvent } from '@contexts/todo/domain/events/todo-updated.event';
import { TodoCompletedEvent } from '@contexts/todo/domain/events/todo-completed.event';
import { TodoUnCompletedEvent } from '@contexts/todo/domain/events/todo-uncompleted.event';
import { TodoDeletedEvent } from '@contexts/todo/domain/events/todo-deleted.event';

export class Todo extends AggregateRoot {
  #id: TodoIdVO;
  #title: TodoTitleVO;
  #description: TodoDescriptionVO | null;
  #completed: boolean;
  #isDeleted: boolean;

  constructor(
    id: TodoIdVO,
    title: TodoTitleVO,
    description: TodoDescriptionVO | null,
    completed: boolean,
    isDeleted: boolean,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#completed = completed;
    this.#isDeleted = isDeleted;
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get description() {
    return this.#description;
  }

  get completed() {
    return this.#completed;
  }

  get isDeleted() {
    return this.#isDeleted;
  }

  static create(
    id: TodoIdVO,
    title: TodoTitleVO,
    description: TodoDescriptionVO | null,
  ) {
    const todo = new Todo(id, title, description, false, false);
    todo.apply(new TodoCreatedEvent(id));
    return todo;
  }

  updateTitle(title: TodoIdVO) {
    this.#title = title;
    this.apply(new TodoUpdatedEvent(this.#id.value));
  }

  updateDescription(description: TodoDescriptionVO) {
    this.#description = description;
    this.apply(new TodoUpdatedEvent(this.#id.value));
  }

  complete() {
    if (!this.#completed) {
      this.#completed = true;
      this.apply(new TodoCompletedEvent(this.#id.value));
    }
  }

  uncomplete() {
    if (this.#completed) {
      this.#completed = false;
      this.apply(new TodoUnCompletedEvent(this.#id.value));
    }
  }

  delete() {
    this.#isDeleted = true;
    this.apply(new TodoDeletedEvent(this.#id.value));
  }
}
