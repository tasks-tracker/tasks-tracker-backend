CREATE TABLE "users-settings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  avatarUrl TEXT NOT NULL,
  settings JSON NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
