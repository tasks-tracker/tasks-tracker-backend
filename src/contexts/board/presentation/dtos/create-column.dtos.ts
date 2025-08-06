import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnBodyDto {
  @ApiProperty({
    example: 'Example title',
  })
  title: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  boardId: string;

  @ApiProperty({
    example: 0,
  })
  order: number;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  ownerId: string;
}

export class CreateColumnResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}
