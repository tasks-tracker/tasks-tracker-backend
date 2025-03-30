import type { Result } from 'neverthrow';
import { err } from 'neverthrow';
import { ok } from 'neverthrow';
import { AggregateRoot } from '@nestjs/cqrs';
import { TodoIdVO } from '../value-objects';
import { TodoTitleVO } from '../value-objects';
import { TodoDescriptionVO } from '../value-objects';
import { TodoCreatedEvent } from '../events';
import { TodoUpdatedEvent } from '../events';
import { TodoCompletedEvent } from '../events';
import { TodoDeletedEvent } from '../events';
import { UserIdVO } from '../value-objects';
import { TodoNotOwnerExceptionDomainError } from '../domain-errors';
import { TodoAlreadyDeletedDomainError } from '../domain-errors';
import { TodoAlreadyCompletedDomainError } from '../domain-errors';

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
    isCompleted: boolean,
    isDeleted: boolean,
    deadline: Date | null,
    ownerId: UserIdVO,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#isCompleted = isCompleted;
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
    const isCompleted = false;
    const isDeleted = false;
    const todo = new Todo(
      id,
      title,
      description,
      isCompleted,
      isDeleted,
      deadline,
      ownerId,
    );
    todo.apply(new TodoCreatedEvent(id));
    return todo;
  }

  update(
    userId: UserIdVO,
    title: TodoTitleVO,
    description: TodoDescriptionVO | null,
    deadline: Date | null,
  ): Result<null, TodoNotOwnerExceptionDomainError> {
    if (!this.#ownerId.equals(userId)) return err(new TodoNotOwnerExceptionDomainError())

    const updatedFields: Array<string> = [];
    if (!this.#title.equals(title)) {
      this.#title = title;
      updatedFields.push('title');
    }

    if (
      (this.#description !== null && description !== null && !this.#description.equals(description)) ||
      (this.#description === null && description !== null) ||
      (this.#description !== null && description === null)
    ) {
      this.#description = description;
      updatedFields.push('description');
    }

    if (this.#deadline?.getTime() !== deadline?.getTime()) {
      this.#deadline = deadline;
      updatedFields.push('deadline');
    }

    if (updatedFields.length > 0) {
      this.apply(new TodoUpdatedEvent(this.#id, updatedFields));
    }
    this.apply(
      new TodoUpdatedEvent(
        this.#id,
        updatedFields,
      )
    );
    return ok(null);
  }

  markIsCompleted(userId: UserIdVO): Result<null, TodoNotOwnerExceptionDomainError | TodoAlreadyCompletedDomainError> {
    if (!this.#ownerId.equals(userId)) return err(new TodoNotOwnerExceptionDomainError());
    if (this.#isCompleted) return err(new TodoAlreadyCompletedDomainError());
    this.#isCompleted = true;
    this.apply(new TodoCompletedEvent(this.#id));
    return ok(null);
  }

  delete(userId: UserIdVO): Result<null, TodoNotOwnerExceptionDomainError> {
    if (!this.#ownerId.equals(userId)) return err(new TodoNotOwnerExceptionDomainError());
    if (this.#isDeleted) return err(new TodoAlreadyDeletedDomainError())
    this.#isDeleted = true;
    this.apply(new TodoDeletedEvent(this.#id));
    return ok(null);
  }
}
