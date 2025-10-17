import { AggregateRoot } from '@nestjs/cqrs';
import {
  BoardIdVO,
  ColumnIdVO,
  ColumnOrderVO,
  UserIdVO,
  ColumnTitleVO,
} from '../value-objects';
import {
  ColumnCreatedEvent,
  ColumnRemovedEvent,
  ColumnUpdatedEvent,
} from '../events';
import { DomainError } from 'libs/domain-error';

export class Column extends AggregateRoot {
  #id: ColumnIdVO;
  #title: ColumnTitleVO;
  #order: ColumnOrderVO;
  #boardId: BoardIdVO;
  #creatorId: UserIdVO;
  #createdAt: Date;
  #updatedAt: Date;
  #isDeleted: boolean;

  constructor(
    id: ColumnIdVO,
    title: ColumnTitleVO,
    order: ColumnOrderVO,
    boardId: BoardIdVO,
    creatorId: UserIdVO,
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
    creatorId: UserIdVO,
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

  update(columnData: {
    title?: ColumnTitleVO;
    order?: ColumnOrderVO;
    boardId?: BoardIdVO;
    ownerId?: UserIdVO;
    isDeleted?: boolean;
    updatedAt?: Date;
    createdAt?: Date;
  }) {
    if (Object.keys(columnData).length === 0) {
      throw new DomainError('NO_DATA_TO_UPDATE');
    }

    if (columnData.title) {
      this.#title = columnData.title;
    }
    if (columnData.order) {
      this.#order = columnData.order;
    }
    if (columnData.boardId) {
      this.#boardId = columnData.boardId;
    }
    if (columnData.ownerId) {
      this.#creatorId = columnData.ownerId;
    }
    if (columnData.isDeleted) {
      this.#isDeleted = columnData.isDeleted;
    }
    if (columnData.updatedAt) {
      this.#updatedAt = columnData.updatedAt;
    }

    if (columnData.createdAt) {
      this.#createdAt = columnData.createdAt;
    }

    this.apply(new ColumnUpdatedEvent(this.#id, columnData));
  }

  delete() {
    if (this.#isDeleted) {
      throw new DomainError('COLUMN_ALREADY_DELETED');
    }

    this.apply(new ColumnRemovedEvent(this.#id));
    return this;
  }
}
