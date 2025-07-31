import { AggregateRoot } from '@nestjs/cqrs';
import {
  BoardIdVO,
  ColumnIdVO,
  ColumnOrderVO,
  ColumnOwnerIdVO,
  ColumnTitleVO,
} from '../value-objects';
import {
  ColumnCreatedEvent,
  ColumnChangeOwnerEvent,
  ColumnRenameEvent,
  ColumnChangeOrderEvent,
  ColumnChangeBoardEvent,
  ColumnRemovedEvent,
} from '../events';

export class Column extends AggregateRoot {
  #id: ColumnIdVO;
  #title: ColumnTitleVO;
  #order: ColumnOrderVO;
  #boardId: BoardIdVO;
  #creatorId: ColumnOwnerIdVO;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(
    id: ColumnIdVO,
    title: ColumnTitleVO,
    order: ColumnOrderVO,
    boardId: BoardIdVO,
    creatorId: ColumnOwnerIdVO,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#order = order;
    this.#boardId = boardId;
    this.#creatorId = creatorId;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get creatorId() {
    return this.#creatorId;
  }

  get order() {
    return this.#order;
  }

  get boardId() {
    return this.#boardId;
  }

  get craetedAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  static create(
    id: ColumnIdVO,
    title: ColumnTitleVO,
    order: ColumnOrderVO,
    boardId: BoardIdVO,
    createdAt: Date,
    updatedAt: Date,
    creatorId: ColumnOwnerIdVO,
  ): Column {
    const column = new Column(
      id,
      title,
      order,
      boardId,
      creatorId,
      createdAt,
      updatedAt,
    );
    column.apply(new ColumnCreatedEvent(id));
    return column;
  }

  rename(title: ColumnTitleVO) {
    this.#title = title;
    this.#updatedAt = new Date();
    this.apply(new ColumnRenameEvent(title));
  }

  changeCreator(
    currentCreatorId: ColumnOwnerIdVO,
    newCreatorId: ColumnOwnerIdVO,
  ) {
    if (currentCreatorId.value === this.#creatorId.value) {
      this.#creatorId = newCreatorId;
      this.#updatedAt = new Date();
      this.apply(new ColumnChangeOwnerEvent(currentCreatorId, newCreatorId));
      return;
    }

    throw new Error('Current creator does not match the column creator');
  }

  changeOrder(order: ColumnOrderVO) {
    this.#order = order;
    this.#updatedAt = new Date();
    this.apply(new ColumnChangeOrderEvent(order));
  }

  changeBoard(boardId: BoardIdVO) {
    this.#boardId = boardId;
    this.#updatedAt = new Date();
    this.apply(new ColumnChangeBoardEvent(boardId));
  }

  remove() {
    this.apply(new ColumnRemovedEvent(this.#id));
    return this;
  }
}
