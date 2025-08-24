import { ApiProperty } from '@nestjs/swagger';

export class RenameColumnBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;

  @ApiProperty({
    example: 'New Column Title',
  })
  newTitle: string;
}
