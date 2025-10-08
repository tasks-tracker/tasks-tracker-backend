import { ApiProperty } from '@nestjs/swagger';

export class UserPayloadDto {
  @ApiProperty({
    example: 'sessionToken',
  })
  sessionToken: string;

  @ApiProperty({
    example: 'requestId',
  })
  requestId: string;
}
