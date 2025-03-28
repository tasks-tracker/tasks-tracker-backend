import { AggregateRoot } from '@nestjs/cqrs';
import { TodoIdVO } from '@contexts/todo/domain/value-objects';
import { TodoTitleVO } from '@contexts/todo/domain/value-objects';
import { TodoDescriptionVO } from '@contexts/todo/domain/value-objects';
import { TodoCreatedEvent } from '@contexts/todo/domain/events/todo-created.event';
import { TodoUpdatedEvent } from '@contexts/todo/domain/events/todo-updated.event';
import { TodoCompletedEvent } from '@contexts/todo/domain/events/todo-completed.event';
import { TodoUnCompletedEvent } from '@contexts/todo/domain/events/todo-uncompleted.event';
import { TodoDeletedEvent } from '@contexts/todo/domain/events/todo-deleted.event';
import { UserIdVO } from '../value-objects/todo-owner-id.value-object';
import { TodoNotOwnerExceptionDomainError } from '@contexts/todo/domain/domain-errors/todo-not-owner-exception.domain-error';

export class Todo extends AggregateRoot {
  #id: TodoIdVO;
  #title: TodoTitleVO;
  #description: TodoDescriptionVO | null;
  #isCompleted: boolean;
  #isDeleted: boolean;
  #deadline: Date | null;
  #ownerId: UserIdVO;

  constructor(
    id: TodoIdVO,
    title: TodoTitleVO,
    description: TodoDescriptionVO | null,
    completedStatus: boolean,
    isDeleted: boolean,
    deadline: Date | null,
    ownerId: UserIdVO,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#isCompleted = completedStatus;
    this.#isDeleted = isDeleted;
    this.#deadline = deadline;
    this.#ownerId = ownerId;
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

  get completedStatus() {
    return this.#isCompleted;
  }

  get isDeleted() {
    return this.#isDeleted;
  }

  get ownerId() {
    return this.#ownerId;
  }

  static create(
    id: TodoIdVO,
    title: TodoTitleVO,
    description: TodoDescriptionVO | null,
    deadline: Date | null,
    ownerId: UserIdVO,
  ): Todo {
    const todo = new Todo(
      id,
      title,
      description,
      false,
      false,
      deadline,
      ownerId,
    );
    todo.apply(new TodoCreatedEvent(id));
    return todo;
  }

  update(
    title: TodoTitleVO,
    isCompleted: boolean,
    description: TodoDescriptionVO | null,
    deadline: Date | null,
  ) {
    this.#title = title;
    this.#description = description;
    this.#deadline = deadline;
    this.#isCompleted = isCompleted;
    this.apply(new TodoUpdatedEvent(this.#id.value));
  }

  markIsCompleted(userId: UserIdVO) {
    if (!this.#ownerId.equals(userId)) {
      throw new TodoNotOwnerExceptionDomainError();
    }
    this.#isCompleted = true;
    this.apply(new TodoCompletedEvent(this.#id.value));
  }

  markIsNotCompleted() {
    this.#isCompleted = false;
    this.apply(new TodoUnCompletedEvent(this.#id.value));
  }

  delete(userId: UserIdVO) {
    if (!this.#ownerId.equals(userId)) {
      throw new TodoNotOwnerExceptionDomainError();
    }
    this.#isDeleted = true;
    this.apply(new TodoDeletedEvent(this.#id.value));
  }

  getDeadline() {
    return this.#deadline;
  }
}
