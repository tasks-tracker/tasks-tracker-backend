import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    example: 'Example title',
  })
  title: string;

  @ApiProperty({
    example: '26241415-39b0-413e-8759-66d5ddde4b45',
  })
  userId: string;
}

export class CreateBoardResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}

export class CreateDefaultBoardBodyDto {
  @ApiProperty({
    example: '26241415-39b0-413e-8759-66d5ddde4b45',
  })
  userId: string;
}
