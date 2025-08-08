import { AggregateRoot } from '@nestjs/cqrs';
import {
  ColumnIdVO,
  TaskDescriptionVO,
  TaskIdVO,
  TaskOrderVO,
  TaskOwnerIdVO,
  TaskTitleVO,
} from '../value-objects';
import {
  TaskChangeColumnEvent,
  TaskChangeDescriptionEvent,
  TaskChangeOrderEvent,
  TaskChangeOwnerEvent,
  TaskChangeTitleEvent,
  TaskCreatedEvent,
  TaskRemovedEvent,
} from '../events';

export class Task extends AggregateRoot {
  #id: TaskIdVO;
  #title: TaskTitleVO;
  #description: TaskDescriptionVO;
  #order: TaskOrderVO;
  #columnId: ColumnIdVO;
  #createdAt: Date;
  #updatedAt: Date;
  #assignerId: TaskOwnerIdVO;
  #isRemoved: boolean;

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
    this.#isRemoved = false;
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

  changeColumn(columnId: ColumnIdVO) {
    this.#columnId = columnId;
    this.apply(new TaskChangeColumnEvent(this.#id, columnId));
  }

  changeDescription(description: TaskDescriptionVO) {
    this.#description = description;
    this.apply(new TaskChangeDescriptionEvent(this.#id, description));
  }

  changeOrder(order: TaskOrderVO) {
    this.#order = order;
    this.apply(new TaskChangeOrderEvent(this.#id, order));
  }

  changeAssigner(assignerId: TaskOwnerIdVO) {
    if (this.#assignerId && this.#assignerId.value !== assignerId.value) {
      throw new Error('Task already has an assigner');
    }
    this.#assignerId = assignerId;
    this.apply(new TaskChangeOwnerEvent(this.#id, assignerId));
  }

  changeTitle(title: TaskTitleVO) {
    if (!this.#isRemoved) {
      throw new Error('Task is removed');
    }

    this.#title = title;
    this.apply(new TaskChangeTitleEvent(this.#id, title));
  }

  remove() {
    if (this.#isRemoved) {
      throw new Error('Task already removed');
    }
    this.#isRemoved = true;
    this.apply(new TaskRemovedEvent(this.#id.value));
  }
}
