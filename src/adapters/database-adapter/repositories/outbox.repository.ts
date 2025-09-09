import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPgPromise } from '@nestjs-cls/transactional-adapter-pg-promise';
import { Injectable } from '@nestjs/common';
import { knex } from 'knex';
import { OutboxSchema } from '../schemas/outbox.schema';

@Injectable()
export class OutboxRepository {
  private readonly knex = knex({ client: 'pg' });
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPgPromise>,
  ) {}

  public async saveEvent(
    event: Omit<
      OutboxSchema,
      'id' | 'created_at' | 'processed_at' | 'retry_count' | 'status'
    >,
  ): Promise<void> {
    const SQL = this.knex<OutboxSchema>('outbox')
      .insert({
        aggregate_id: event.aggregate_id,
        aggregate_type: event.aggregate_type,
        event_type: event.event_type,
        event_data: event.event_data,
        status: 'pending',
        retry_count: 0,
      })
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  public async getPendingEvents(): Promise<OutboxSchema[]> {
    const SQL = this.knex<OutboxSchema>('outbox')
      .select('*')
      .where('status', 'pending')
      .toSQL()
      .toNative();

    return await this.txHost.tx.manyOrNone<OutboxSchema>(SQL.sql, SQL.bindings);
  }

  public async markAsProcessed(event: OutboxSchema): Promise<void> {
    const SQL = this.knex<OutboxSchema>('outbox')
      .update({
        processed_at: new Date(),
        status: 'completed',
      })
      .where('id', event.id)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  public async markAsFailed(
    event: OutboxSchema,
    retryCount: number,
  ): Promise<void> {
    const SQL = this.knex<OutboxSchema>('outbox')
      .update({
        processed_at: new Date(),
        status: 'failed',
        retry_count: retryCount,
      })
      .where('id', event.id)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }

  public async incrementRetryCount(event: OutboxSchema): Promise<void> {
    const SQL = this.knex<OutboxSchema>('outbox')
      .update({
        retry_count: event.retry_count + 1,
        status: 'pending',
      })
      .where('id', event.id)
      .toSQL()
      .toNative();

    await this.txHost.tx.none(SQL.sql, SQL.bindings);
  }
}
