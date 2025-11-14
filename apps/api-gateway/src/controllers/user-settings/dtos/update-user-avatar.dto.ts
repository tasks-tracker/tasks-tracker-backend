import { ApiProperty } from '@nestjs/swagger';
import { Settings } from 'apps/user/src/core/domain';

export class UpdateUserAvatarResponseDto {
  @ApiProperty({
    example: 'SUCCESS',
  })
  status: string;
  @ApiProperty({
    example: 'User avatar updated successfully',
  })
  message: string;
}

export class UpdateUserAvatarRequestDto {
  @ApiProperty({
    example: '1234-1234-1234-1234',
  })
  userId: string;
  @ApiProperty({
    example: 'https://example.com/avatar.png',
  })
  avatarUrl: string;
}

export class GetUserSettingsRequestDto {
  @ApiProperty({
    example: '1234-1234-1234-1234',
  })
  userId: string;
}

export class UpdateUserSettingsRequestDto {
  @ApiProperty({
    example: '1234-1234-1234-1234',
  })
  userId: string;
  @ApiProperty({
    example: { theme: 'light', language: 'en', notificationsEnabled: true },
  })
  settings: Partial<Settings>;
}
