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
  #assignerId: TaskOwnerIdVO;

  constructor(
    id: TaskIdVO,
    title: TaskTitleVO,
    description: TaskDescriptionVO,
    order: TaskOrderVO,
    columnId: ColumnIdVO,
    createdAt: Date,
    updatedAt: Date,
    assignerId: TaskOwnerIdVO,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#order = order;
    this.#columnId = columnId;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    this.#assignerId = assignerId;
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

  get assignerId() {
    return this.#assignerId;
  }

  static create(
    id: TaskIdVO,
    title: TaskTitleVO,
    description: TaskDescriptionVO,
    order: TaskOrderVO,
    columnId: ColumnIdVO,
    createdAt: Date,
    updatedAt: Date,
    assignerId: TaskOwnerIdVO,
  ) {
    const task = new Task(
      id,
      title,
      description,
      order,
      columnId,
      createdAt,
      updatedAt,
      assignerId,
    );

    task.apply(new TaskCreatedEvent(id));
    return task;
  }
}
