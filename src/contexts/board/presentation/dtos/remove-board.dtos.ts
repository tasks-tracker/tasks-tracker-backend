import { ApiProperty } from '@nestjs/swagger';

export class RemoveBoardBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;
}
