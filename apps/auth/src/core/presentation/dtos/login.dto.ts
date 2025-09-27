import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'login',
  })
  login: string;

  @ApiProperty({
    example: 'P@ssword123',
  })
  password: string;
  requestId: string;
}
