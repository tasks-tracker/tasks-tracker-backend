import { AggregateRoot } from '@nestjs/cqrs';
import { BoardIdVO, BoardOwnerIdVO, BoardTitleVO } from '../value-objects';
import {
  BoardCreatedEvent,
  BoardOwnerChangedEvent,
  BoardRemovedEvent,
  BoardRenameEvent,
} from '../events';

export class Board extends AggregateRoot {
  #id: BoardIdVO;
  #title: BoardTitleVO;
  #ownerId: BoardOwnerIdVO;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(
    id: BoardIdVO,
    title: BoardTitleVO,
    ownerId: BoardOwnerIdVO,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.#id = id;
    this.#title = title;
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

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  static create(
    id: BoardIdVO,
    title: BoardTitleVO,
    ownerId: BoardOwnerIdVO,
    createdAt: Date,
    updatedAt: Date,
  ) {
    const board = new Board(id, title, ownerId, createdAt, updatedAt);
    board.apply(new BoardCreatedEvent(id));
  }

  rename(title: BoardTitleVO) {
    this.#title = title;
    this.#updatedAt = new Date();
    this.apply(new BoardRenameEvent(title));
  }

  changeOwner(ownerId: BoardOwnerIdVO) {
    this.#ownerId = ownerId;
    this.#updatedAt = new Date();
    this.apply(new BoardOwnerChangedEvent(ownerId));
  }

  remove() {
    this.apply(new BoardRemovedEvent(this.#id.value));
    return this;
  }
}
