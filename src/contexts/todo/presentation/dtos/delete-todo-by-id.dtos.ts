import { ApiProperty } from '@nestjs/swagger';

export class DeleteTodoByIdBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  todoId: string;
}
