import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    example: 'sessionToken',
  })
  sessionToken: string;

  @ApiProperty({
    example: 'requestId',
  })
  requestId: string;
}
