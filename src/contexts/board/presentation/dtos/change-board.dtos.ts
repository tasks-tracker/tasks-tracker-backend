import { ApiProperty } from '@nestjs/swagger';

export class ChangeColumnBoardBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;
}

export class ChangeColumnBoardResponseDto {
  @ApiProperty({
    example: 'Column board changed successfully',
  })
  message: string;
}
