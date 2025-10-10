export class CreateBoardDto {
  title: string;
  userId: string;
  requestId: string;
}

export class ChangeOwnerDto {
  boardId: string;
  newOwnerId: string;
  userId: string;
  requestId: string;
}

export class RemoveBoardDto {
  boardId: string;
  requestId: string;
}

export class GetBoardDto {
  boardId: string;
  requestId: string;
}

export class CreateColumnDto {
  title: string;
  boardId: string;
  requestId: string;
  order: number;
  userId: string;
}

export class ChangeColumnBoardDto {
  columnId: string;
  boardId: string;
  requestId: string;
}

export class ChangeColumnOwnerDto {
  columnId: string;
  ownerId: string;
  requestId: string;
}

export class RemoveColumnDto {
  columnId: string;
  requestId: string;
}

export class RenameColumnDto {
  columnId: string;
  newTitle: string;
  userId: string;
  requestId: string;
}

export class GetColumnInfoDto {
  columnId: string;
  requestId: string;
}

export class CreateTaskDto {
  title: string;
  description: string;
  order: number;
  columnId: string;
  userId: string;
  requestId: string;
}

export class DeleteTaskDto {
  taskId: string;
  requestId: string;
}

export class RenameTaskDto {
  taskId: string;
  newTitle: string;
  requestId: string;
}

export class ChangeTaskColumnDto {
  taskId: string;
  columnId: string;
  requestId: string;
}

export class ChangeTaskDescriptionDto {
  taskId: string;
  description: string;
  requestId: string;
}

export class ChangeTaskOrderDto {
  taskId: string;
  order: number;
  requestId: string;
}

export class ChangeTaskAssigneeDto {
  taskId: string;
  assigneeId: string;
  requestId: string;
}

export class GetTaskInfoDto {
  taskId: string;
  requestId: string;
}

export class RenameBoardDto {
  boardId: string;
  newTitle: string;
  requestId: string;
  userId: string;
}

export class GetFullBoardDto {
  userId: string;
  requestId: string;
}
