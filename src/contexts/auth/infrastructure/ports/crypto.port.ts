import type { CryptoPort } from '../../domain';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordVO } from '../../domain';
import { PasswordHashVO } from '../../domain';

@Injectable()
export class CryptoPortImpl implements CryptoPort {
  private readonly saltRounds = 10;

  public async hashPassword(
    password: PasswordVO,
  ): Promise<PasswordHashVO> {
    const passwordHash = await bcrypt.hash(password.value, this.saltRounds);
    return new PasswordHashVO(passwordHash);
  }

  public async comparePassword(
    password: PasswordVO,
    hash: PasswordHashVO,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password.value, hash.value);
    } catch {
      return false;
    }
  }
}
