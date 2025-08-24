import { ApiProperty } from '@nestjs/swagger';

export class RemoveColumnBodyDto {
  @ApiProperty({
    example: '1234-5678-9012-3456',
  })
  columnId: string;
}

export class RemoveColumnResponseDto {
  @ApiProperty({
    example: 'Column removed successfully',
  })
  message: string;
}
