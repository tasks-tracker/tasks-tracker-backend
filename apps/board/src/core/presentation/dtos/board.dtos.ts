export class CreateBoardDto {
  title: string;
  userId: string;
  requestId: string;
}

export class ChangeOwnerDto {
  boardId: string;
  newOwnerId: string;
  userId: string;
}

export class RemoveBoardDto {
  boardId: string;
}

export class GetBoardDto {
  userId: string;
}

export class CreateColumnDto {
  title: string;
  boardId: string;
  order: number;
  ownerId: string;
}

export class ChangeColumnBoardDto {
  columnId: string;
  boardId: string;
}

export class ChangeColumnOwnerDto {
  columnId: string;
  ownerId: string;
}

export class RemoveColumnDto {
  columnId: string;
}

export class RenameColumnDto {
  columnId: string;
  newTitle: string;
  userId: string;
}

export class GetColumnInfoDto {
  columnId: string;
}

export class CreateTaskDto {
  title: string;
  description: string;
  order: number;
  columnId: string;
  userId: string;
}

export class DeleteTaskDto {
  taskId: string;
}

export class RenameTaskDto {
  taskId: string;
  newTitle: string;
}

export class ChangeTaskColumnDto {
  taskId: string;
  columnId: string;
}

export class ChangeTaskDescriptionDto {
  taskId: string;
  description: string;
}

export class ChangeTaskOrderDto {
  taskId: string;
  order: number;
}

export class ChangeTaskAssigneeDto {
  taskId: string;
  assigneeId: string;
}

export class GetTaskInfoDto {
  taskId: string;
}

export class RenameBoardDto {
  boardId: string;
  newTitle: string;
  userId: string;
}
