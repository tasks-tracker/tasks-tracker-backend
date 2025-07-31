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
  #ownerId: ColumnOwnerIdVO;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(
    id: ColumnIdVO,
    title: ColumnTitleVO,
    order: ColumnOrderVO,
    boardId: BoardIdVO,
    ownerId: ColumnOwnerIdVO,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#order = order;
    this.#boardId = boardId;
    this.#ownerId = ownerId;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get ownerId() {
    return this.#ownerId;
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
    ownerId: ColumnOwnerIdVO,
  ): Column {
    const column = new Column(
      id,
      title,
      order,
      boardId,
      ownerId,
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

  changeOwner(ownerId: ColumnOwnerIdVO) {
    this.#ownerId = ownerId;
    this.#updatedAt = new Date();
    this.apply(new ColumnChangeOwnerEvent(this.#id, ownerId));
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
