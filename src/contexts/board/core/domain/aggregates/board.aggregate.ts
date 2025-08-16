import { AggregateRoot } from '@nestjs/cqrs';
import { BoardIdVO, BoardOwnerIdVO, BoardTitleVO } from '../value-objects';
import {
  BoardCreatedEvent,
  BoardOwnerChangedEvent,
  BoardRemovedEvent,
  BoardRenameEvent,
} from '../events';
import { UserIdVO } from '@contexts/auth';
import { err, ok, Result } from 'neverthrow';
import { BoardIsNotOwnerDomainError } from '../domain-errors';

export class Board extends AggregateRoot {
  #id: BoardIdVO;
  #title: BoardTitleVO;
  #ownerId: BoardOwnerIdVO;
  #createdAt: Date;
  #updatedAt: Date;
  #isDeleted: boolean;

  constructor(
    id: BoardIdVO,
    title: BoardTitleVO,
    ownerId: BoardOwnerIdVO,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#ownerId = ownerId;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    this.#isDeleted = isDeleted;
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

  get isDeleted() {
    return this.#isDeleted;
  }

  static create(
    id: BoardIdVO,
    title: BoardTitleVO,
    ownerId: BoardOwnerIdVO,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
  ) {
    const isRemoved = isDeleted || false;
    const board = new Board(
      id,
      title,
      ownerId,
      createdAt,
      updatedAt,
      isRemoved,
    );
    board.apply(new BoardCreatedEvent(id));
    return board;
  }

  rename(
    newTitle: BoardTitleVO,
    userId: UserIdVO,
  ): Result<null, BoardIsNotOwnerDomainError> {
    if (this.#ownerId.value !== userId.value) {
      return err(new BoardIsNotOwnerDomainError());
    }
    this.#title = newTitle;
    this.#updatedAt = new Date();
    this.apply(new BoardRenameEvent(newTitle));
    return ok(null);
  }

  changeOwner(currentOwnerId: BoardOwnerIdVO, newOwnerId: BoardOwnerIdVO) {
    if (currentOwnerId.value === this.#ownerId.value) {
      this.#ownerId = newOwnerId;
      this.#updatedAt = new Date();
      this.apply(new BoardOwnerChangedEvent(currentOwnerId));
      return;
    }

    throw new Error('Current owner does not match the board owner');
  }

  remove(): Result<null, Error> {
    if (this.#isDeleted) {
      throw new Error('Board already removed');
    }
    this.#isDeleted = true;
    this.apply(new BoardRemovedEvent(this.#id));
    return ok(null);
  }
}
