import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTodoBodyDto {
  @ApiProperty({
    example: '1234-1234-1234-1234',
  })
  todoId: string;

  @ApiPropertyOptional({
    example: 'Example title',
  })
  title?: string;

  @ApiPropertyOptional({
    example: 'description',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 1630000000,
    description: 'Unix timestamp',
  })
  deadline?: number;
}
