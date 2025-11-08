import { Settings } from 'apps/user/src/core/domain';

export interface UserSettingsSchema {
  id: string;
  user_id: string;
  avatarUrl: string;
  settings: Settings;
  createdAt: Date;
  updatedAt: Date;
}
