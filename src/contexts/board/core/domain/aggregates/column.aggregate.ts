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
import { UserIdVO } from '@contexts/auth';
import { DomainError } from '@libs/domain-error';

export class Column extends AggregateRoot {
  #id: ColumnIdVO;
  #title: ColumnTitleVO;
  #order: ColumnOrderVO;
  #boardId: BoardIdVO;
  #creatorId: ColumnOwnerIdVO;
  #createdAt: Date;
  #updatedAt: Date;
  #isDeleted: boolean;

  constructor(
    id: ColumnIdVO,
    title: ColumnTitleVO,
    order: ColumnOrderVO,
    boardId: BoardIdVO,
    creatorId: ColumnOwnerIdVO,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
  ) {
    super();
    this.#id = id;
    this.#title = title;
    this.#order = order;
    this.#boardId = boardId;
    this.#creatorId = creatorId;
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

  get isDeleted() {
    return this.#isDeleted;
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
      false,
    );
    column.apply(new ColumnCreatedEvent(id));
    return column;
  }

  rename(userId: UserIdVO, title: ColumnTitleVO) {
    if (userId.value !== this.#creatorId.value) {
      throw new DomainError('USER_NOT_AUTHORIZED');
    }
    this.#title = title;
    this.#updatedAt = new Date();
    this.apply(new ColumnRenameEvent(title));
  }

  changeCreator(newCreatorId: UserIdVO) {
    this.#creatorId = new ColumnOwnerIdVO(newCreatorId.value);
    this.#updatedAt = new Date();
    this.apply(new ColumnChangeOwnerEvent(this.#creatorId, newCreatorId));
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

  delete() {
    if (this.#isDeleted) {
      throw new DomainError('COLUMN_ALREADY_DELETED');
    }

    this.apply(new ColumnRemovedEvent(this.#id));
    return this;
  }
}
