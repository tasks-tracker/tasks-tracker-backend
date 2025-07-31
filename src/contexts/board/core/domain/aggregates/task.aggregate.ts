import { AggregateRoot } from '@nestjs/cqrs';
import {
  ColumnIdVO,
  TaskDescriptionVO,
  TaskIdVO,
  TaskOrderVO,
  TaskOwnerIdVO,
  TaskTitleVO,
} from '../value-objects';
import { TaskCreatedEvent } from '../events';

export class Task extends AggregateRoot {
  #id: TaskIdVO;
  #title: TaskTitleVO;
  #description: TaskDescriptionVO;
  #order: TaskOrderVO;
  #columnId: ColumnIdVO;
  #createdAt: Date;
  #updatedAt: Date;
  #ownerId: TaskOwnerIdVO;

  constructor(
    id: TaskIdVO,
    title: TaskTitleVO,
    description: TaskDescriptionVO,
    order: TaskOrderVO,
    columnId: ColumnIdVO,
    createdAt: Date,
    updatedAt: Date,
    ownerId: TaskOwnerIdVO,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#order = order;
    this.#columnId = columnId;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
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

  get order() {
    return this.#order;
  }

  get columnId() {
    return this.#columnId;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  get ownerId() {
    return this.#ownerId;
  }

  static create(
    id: TaskIdVO,
    title: TaskTitleVO,
    description: TaskDescriptionVO,
    order: TaskOrderVO,
    columnId: ColumnIdVO,
    createdAt: Date,
    updatedAt: Date,
    ownerId: TaskOwnerIdVO,
  ) {
    const task = new Task(
      id,
      title,
      description,
      order,
      columnId,
      createdAt,
      updatedAt,
      ownerId,
    );

    task.apply(new TaskCreatedEvent(id));
    return task;
  }
}
