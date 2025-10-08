import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    example: 'Example title',
  })
  title: string;

  @ApiProperty({
    example: '26241415-39b0-413e-8759-66d5ddde4b45',
  })
  userId: string;
}

export class RenameTaskDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
  @ApiProperty({
    example: 'Example title',
  })
  newTitle: string;
}

export class TaskChangeOrderDto {
  @ApiProperty({
    example: 'e53afc1d-0b4c-43f0-9889-81f769c67bdb',
  })
  taskId: number;
  @ApiProperty({
    example: 1,
  })
  order: number;
}

export class GetBoardDto {
  @ApiProperty({
    example: 'e0a89e34-8210-4280-89c4-a46e9af2b450',
  })
  boardId: string;
}

export class GetTaskInfoDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
}

export class CreateBoardResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class CreateDefaultBoardBodyDto {
  @ApiProperty({
    example: '26241415-39b0-413e-8759-66d5ddde4b45',
  })
  userId: string;
}

export class ChangeOwnerDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;
  @ApiProperty({
    example: '26241415-39b0-413e-8759-66d5ddde4b45',
  })
  newOwnerId: string;
}

export class RemoveBoardDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;
}

export class RenameBoardDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;
  @ApiProperty({
    example: 'Example title',
  })
  newTitle: string;
}

export class ChangeColumnBoardDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;
}

export class ChangeColumnOwnerDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  ownerId: string;
}

export class RemoveColumnDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
}

export class RenameColumnDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
  @ApiProperty({
    example: 'Example title',
  })
  newTitle: string;
}

export class GetColumnInfoDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
}

export class CreateTaskDto {
  @ApiProperty({
    example: 'Example title',
  })
  title: string;
  @ApiProperty({
    example: 'Example description',
  })
  description: string;
  @ApiProperty({
    example: 1,
  })
  order: number;
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
  @ApiProperty({
    example: '26241415-39b0-413e-8759-66d5ddde4b45',
  })
  userId: string;
}

export class DeleteTaskDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
}

export class ChangeTaskColumnDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
}

export class ChangeTaskDescriptionDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
  @ApiProperty({
    example: 'Example description',
  })
  description: string;
}

export class ChangeTaskOrderDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
  @ApiProperty({
    example: 1,
  })
  order: number;
}

export class ChangeTaskAssigneeDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
  @ApiProperty({
    example: '26241415-39b0-413e-8759-66d5ddde4b45',
  })
  assigneeId: string;
}

export class CreateColumnDto {
  @ApiProperty({
    example: 'Example title',
  })
  title: string;
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;
  @ApiProperty({
    example: 1,
  })
  order: number;
}
