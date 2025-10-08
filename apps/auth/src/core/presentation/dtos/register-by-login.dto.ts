import { ApiProperty } from '@nestjs/swagger';

export class RegisterByLoginBodyDto {
  @ApiProperty({
    description: 'Login must have at least 3 characters',
    example: 'login123',
  })
  login: string;

  @ApiProperty({
    description:
      'Password must have at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    example: 'P@ssword123',
  })
  password: string;

  requestId: string;
}
