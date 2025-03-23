import { ApiProperty } from '@nestjs/swagger';

export class LoginBodyDto {
  @ApiProperty({
    example: 'login',
  })
  login: string;

  @ApiProperty({
    example: 'P@ssword123',
  })
  password: string;
}
