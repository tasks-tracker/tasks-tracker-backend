import { ApiProperty } from '@nestjs/swagger';

export class ChangeColumnOwnerBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;

  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  ownerId: string;
}
