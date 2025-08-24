import { ApiProperty } from '@nestjs/swagger';

export class ExistByUserIdQueryDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
    description: 'User ID',
  })
  userId: string;
}
