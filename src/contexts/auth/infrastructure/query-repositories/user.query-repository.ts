import type { UserQueryRepository } from '../../application';
import type { UserInfo } from '../../application';

import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';

import { UserIdVO } from '../../domain';

@Injectable()
export class UserQueryRepositoryImpl implements UserQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) { }

  public async getUserInfoById(userId: UserIdVO): Promise<UserInfo | null> {
    console.log('this1')
    const userInfo = await this.txHost.tx.oneOrNone<UserInfo>(
      `SELECT 
        id,
        login,
        registered_at as "registeredAt"
       FROM users WHERE id = $1`,
      userId.value,
    )
    console.log('this2')
    return userInfo;
  }
}
