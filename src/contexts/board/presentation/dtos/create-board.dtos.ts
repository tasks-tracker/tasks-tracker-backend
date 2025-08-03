import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardBodyDto {
  @ApiProperty({
    example: 'Example title',
  })
  title: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  ownerId: string;
}
