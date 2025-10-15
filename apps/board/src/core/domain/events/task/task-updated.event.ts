import {
  ColumnIdVO,
  TaskIdVO,
  TaskTitleVO,
  TaskDescriptionVO,
  TaskOrderVO,
  UserIdVO,
} from '../../value-objects';

export class TaskUpdatedEvent {
  constructor(
    readonly id: TaskIdVO,
    readonly userData: {
      title?: TaskTitleVO;
      description?: TaskDescriptionVO;
      order?: TaskOrderVO;
      columnId?: ColumnIdVO;
      assignerId?: UserIdVO;
    },
  ) {}
}
