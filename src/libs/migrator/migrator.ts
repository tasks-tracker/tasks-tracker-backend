/* eslint-disable */
import type { Logger } from '../logger';
import type { Migration } from './interface';
import type { IDatabase } from 'pg-promise';

import * as fs from 'node:fs';
import { join } from 'path';

import { MigrationDirection } from './interface';
import { MigrationStatus } from './interface';

export class Migrator {
  constructor(
    private readonly db: IDatabase<any>,
    private readonly migrationsPath: string,
    private readonly migrationTable: string,
    private readonly logger: Logger,
  ) { }

  private async ensureMigrationsTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS ${this.migrationTable} (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT now()
      )
    `);
  }

  private parseMigrationFileName(fileName: string): Migration {
    const [numberString, name, migrationDirection] = fileName.split('.');
    const number = parseInt(numberString);
    if (isNaN(number))
      throw new Error(`Invalid migration number: ${numberString}`);
    let direction: MigrationDirection;
    if (migrationDirection === MigrationDirection.UP)
      direction = MigrationDirection.UP;
    else if (migrationDirection === MigrationDirection.DOWN)
      direction = MigrationDirection.DOWN;
    else throw new Error(`Invalid migration direction: ${migrationDirection}`);
    return { number, name, direction, status: MigrationStatus.UNKNOWN };
  }

  private async getMigrationsInDir(): Promise<Array<Migration>> {
    const allMigrationFiles = await fs.promises.readdir(this.migrationsPath);
    const migrations = allMigrationFiles.map(this.parseMigrationFileName);
    return migrations;
  }

  private async getAppliedMigrations(): Promise<Array<Migration>> {
    const res = await this.db.manyOrNone(
      `SELECT number, name FROM ${this.migrationTable} ORDER BY number`,
    );
    return res.map((row) => ({
      number: row.number,
      name: row.name,
      direction: MigrationDirection.UP,
      status: MigrationStatus.APPLIED,
    }));
  }

  private async getPendingMigrations(): Promise<Array<Migration>> {
    const migrations = await this.getMigrationsInDir();
    const upMigrations = migrations.filter(
      (migration) => migration.direction === MigrationDirection.UP,
    );
    const applied = await this.getAppliedMigrations();
    const pending = upMigrations.filter(
      (migration) =>
        !applied.some(
          (appliedMigration) => appliedMigration.name === migration.name,
        ),
    );
    const pendingWithCorrectStatus = pending.map((migration) => ({
      ...migration,
      status: MigrationStatus.PENDING,
    }));
    return pendingWithCorrectStatus;
  }

  private async findMigrationFile(
    migration: Migration,
  ): Promise<string | null> {
    const files = await fs.promises.readdir(this.migrationsPath);

    const regex = new RegExp(
      `^0*${migration.number}\\.([^.]*)\\.(${MigrationDirection.UP}|${MigrationDirection.DOWN})\\.sql$`,
    );

    const foundFile = files.find((file) => {
      const match = file.match(regex);
      return match && match[2] === migration.direction;
    });

    return foundFile ? join(this.migrationsPath, foundFile) : null;
  }

  private async runMigration(migration: Migration) {
    const filePath = await this.findMigrationFile(migration);
    if (!filePath) {
      this.logger.error(
        `Migration file not found for ${migration.name} (${migration.direction})`,
      );
      return;
    }
    const sql = await fs.promises.readFile(filePath, 'utf8');

    try {
      this.logger.log(
        `Running migration ${migration.name} (${migration.direction})`,
      );
      await this.db.query('BEGIN');
      this.logger.debug(
        `Started transaction for migration ${migration.name} (${migration.direction})`,
      );
      await this.db.query(sql);

      if (migration.direction === MigrationDirection.UP) {
        await this.db.query(
          `INSERT INTO ${this.migrationTable} (number, name) VALUES ($1, $2)`,
          [migration.number, migration.name],
        );
      } else {
        await this.db.query(
          `DELETE FROM ${this.migrationTable} WHERE number = $1`,
          [migration.number],
        );
      }

      await this.db.query('COMMIT');
      this.logger.log(
        `Success execute sql for migration ${migration.name} (${migration.direction})`,
      );
    } catch (error) {
      await this.db.query('ROLLBACK');
      this.logger.error(`Error in ${migration.name}:`, error);
    }
  }

  private async prepare() {
    try {
      await this.db.connect();
      this.logger.debug('Connected to database');
    } catch (error) {
      this.logger.error('Error connecting to database', error);
      throw error;
    }
    try {
      await this.ensureMigrationsTable();
      this.logger.debug('Migrations table ensured');
    } catch (error) {
      this.logger.error('Error ensuring migrations table', error);
      throw error;
    }
  }

  async migrateUp() {
    await this.prepare();
    const pending = await this.getPendingMigrations();
    if (pending.length === 0) {
      this.logger.log('No migrations to run.');
      return;
    }
    const pendingSorted = pending.sort((a, b) => a.number - b.number);
    for (const file of pendingSorted) {
      await this.runMigration(file);
    }
  }

  async migrateDown() {
    await this.prepare();
    const applied = await this.getAppliedMigrations();
    if (applied.length === 0) {
      this.logger.log('No migrations to rollback.');
      return;
    }

    const lastMigration = applied[applied.length - 1];
    await this.runMigration({
      ...lastMigration,
      direction: MigrationDirection.DOWN,
    });
  }
}
