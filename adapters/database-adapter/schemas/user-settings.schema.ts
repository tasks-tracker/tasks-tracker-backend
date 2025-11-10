import { Settings } from 'apps/user/src/core/domain';

export interface UserSettingsSchema {
  id: string;
  user_id: string;
  avatar_url: string;
  settings: Settings;
  created_at: Date;
  updated_at: Date;
}
