export interface UserSchema {
  id: string;
  login: string;
  password_hash: string;
  registered_at: Date;
}
