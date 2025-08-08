import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskBodyDto {
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
}

export class CreateTaskResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class RenameTaskBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;

  @ApiProperty({
    example: 'Example title',
  })
  title: string;
}

export class RenameTaskResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class ChangeTaskColumnBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
}

export class ChangeTaskColumnResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class ChangeTaskDescriptionBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;

  @ApiProperty({
    example: 'Example description',
  })
  description: string;
}

export class ChangeTaskDescriptionResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class ChangeTaskOrderBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;

  @ApiProperty({
    example: 1,
  })
  order: number;
}

export class ChangeTaskOrderResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class ChangeTaskOwnerBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
}

export class ChangeTaskOwnerResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class GetTaskInfoByIdResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;

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
    example: '1234-5678-9012-3456',
  })
  ownerId: string;
}

export class GetTaskInfoByIdQueryDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}
