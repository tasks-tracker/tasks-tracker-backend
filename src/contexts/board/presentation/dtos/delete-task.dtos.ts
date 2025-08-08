import { ApiProperty } from '@nestjs/swagger';

export class DeleteTaskBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  taskId: string;
}

export class DeleteTaskResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}
