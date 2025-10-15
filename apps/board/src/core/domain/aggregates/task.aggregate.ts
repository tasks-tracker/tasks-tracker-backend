import { AggregateRoot } from '@nestjs/cqrs';
import {
  ColumnIdVO,
  TaskDescriptionVO,
  TaskIdVO,
  TaskOrderVO,
  UserIdVO,
  TaskTitleVO,
} from '../value-objects';
import {
  TaskChangeTitleEvent,
  TaskCreatedEvent,
  TaskRemovedEvent,
  TaskUpdatedEvent,
} from '../events';

export class Task extends AggregateRoot {
  #id: TaskIdVO;
  #title: TaskTitleVO;
  #description: TaskDescriptionVO;
  #order: TaskOrderVO;
  #columnId: ColumnIdVO;
  #createdAt: Date;
  #updatedAt: Date;
  #assignerId: UserIdVO;
  #isRemoved: boolean;

  constructor(
    id: TaskIdVO,
    title: TaskTitleVO,
    description: TaskDescriptionVO,
    order: TaskOrderVO,
    columnId: ColumnIdVO,
    createdAt: Date,
    updatedAt: Date,
    assignerId: UserIdVO,
    isRemoved: boolean,
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
    this.#isRemoved = isRemoved;
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

  get isRemoved() {
    return this.#isRemoved;
  }

  static create(
    id: TaskIdVO,
    title: TaskTitleVO,
    description: TaskDescriptionVO,
    order: TaskOrderVO,
    columnId: ColumnIdVO,
    createdAt: Date,
    updatedAt: Date,
    assignerId: UserIdVO,
    isRemoved: boolean,
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
      isRemoved,
    );

    task.apply(new TaskCreatedEvent(id));
    return task;
  }

  update(userData: {
    title?: TaskTitleVO;
    description?: TaskDescriptionVO;
    order?: TaskOrderVO;
    columnId?: ColumnIdVO;
    assignerId?: UserIdVO;
  }) {
    if (Object.keys(userData).length === 0) {
      throw new Error('No data to update');
    }

    if (userData.title) {
      this.#title = userData.title;
    }
    if (userData.description) {
      this.#description = userData.description;
    }
    if (userData.order) {
      this.#order = userData.order;
    }
    if (userData.columnId) {
      this.#columnId = userData.columnId;
    }
    if (userData.assignerId) {
      this.#assignerId = userData.assignerId;
    }

    this.apply(new TaskUpdatedEvent(this.#id, userData));
  }

  changeTitle(title: TaskTitleVO) {
    if (this.#isRemoved) {
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
