import { ApiProperty } from '@nestjs/swagger';

export class GetUserInfoResponseDto {
  @ApiProperty({
    example: '1234-1234-1234-1234',
  })
  id: string;
  @ApiProperty({
    example: 'login',
  })
  login: string;
  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
  })
  registeredAt: Date;
}
