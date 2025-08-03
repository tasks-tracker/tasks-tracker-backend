import { ApiProperty } from '@nestjs/swagger';

export class RenameBoardBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;

  @ApiProperty({
    example: 'New Board Title',
  })
  newTitle: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  userId: string;
}
