import { ApiProperty } from '@nestjs/swagger';

export class GetColumnInfoByIdQueryDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
    description: 'Column ID',
  })
  columnId: string;
}

export class GetColumnInfoByIdResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
    description: 'Column ID',
  })
  id: string;
}
