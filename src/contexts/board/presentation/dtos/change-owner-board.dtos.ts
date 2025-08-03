import { ApiProperty } from '@nestjs/swagger';

export class ChangeOwnerBoardBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  newOwnerId: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  currentOwnerId: string;
}
