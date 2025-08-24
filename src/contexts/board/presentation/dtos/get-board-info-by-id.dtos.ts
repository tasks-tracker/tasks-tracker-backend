import { ApiProperty } from '@nestjs/swagger';

export class GetBoardInfoByIdQueryDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
    description: 'Board ID',
  })
  boardId: string;
}

export class GetFullBoardQueryDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
    description: 'User ID',
  })
  userId: string;
}
