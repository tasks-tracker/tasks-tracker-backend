import {
  BoardIdVO,
  ColumnIdVO,
  ColumnOrderVO,
  ColumnTitleVO,
  UserIdVO,
} from '../../value-objects';

export class ColumnUpdatedEvent {
  constructor(
    readonly id: ColumnIdVO,
    readonly columnData: {
      title?: ColumnTitleVO;
      order?: ColumnOrderVO;
      boardId?: BoardIdVO;
      ownerId?: UserIdVO;
      isDeleted?: boolean;
      updatedAt?: Date;
      createdAt?: Date;
    },
  ) {}
}
