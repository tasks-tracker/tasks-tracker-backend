import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UpdateTodoFieldsDto {
  @ApiPropertyOptional({
    example: 'Example title',
  })
  title?: string;

  @ApiPropertyOptional({
    example: 'description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    example: 1630000000,
    description: 'Unix timestamp',
  })
  deadline?: number | null;
}

export class UpdateTodoBodyDto {
  @ApiProperty({
    example: '1234-1234-1234-1234',
  })
  todoId: string;

  @ApiPropertyOptional({ type: () => UpdateTodoFieldsDto })
  fields?: UpdateTodoFieldsDto;
}
