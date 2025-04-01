import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoBodyDto {
  @ApiProperty({
    example: 'Example title',
  })
  title: string;

  @ApiProperty({
    example: 'description',
  })
  description: string;

  @ApiProperty({
    example: 1630000000,
    description: 'Unix timestamp',
  })
  deadline: number;
}

export class CreateTodoResponseDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  id: string;
}
