import { Settings } from '../../domain';

export class UpdateUserAvatarDto {
  userId: string;
  avatarUrl: string;
  requestId: string;
}

export class GetUserSettingsDto {
  userId: string;
  requestId: string;
}

export class UpdateUserSettingsDto {
  userId: string;
  settings: Partial<Settings>;
  requestId: string;
}
