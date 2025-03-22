import type { PasswordVO } from '../value-objects';
import type { PasswordHashVO } from '../value-objects';

export abstract class CryptoPort {
  public abstract hashPassword(
    password: PasswordVO,
  ): Promise<PasswordHashVO>;
  public abstract comparePassword(
    password: PasswordVO,
    hash: PasswordHashVO,
  ): Promise<boolean>;
}
