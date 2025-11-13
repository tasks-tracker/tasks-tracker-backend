export class UpdateUserAvatarDto {
  userId: string;
  avatarUrl: string;
  requestId: string;
}

export class GetUserSettingsDto {
  userId: string;
  requestId: string;
}
