import * as dotenv from 'dotenv';
if (process.env.ENV_PATH) dotenv.config({ path: process.env.ENV_PATH });

import { Migrator } from '@libs/migrator';
import { join } from 'node:path';
import { databaseConfig } from '@adapters/config-adapter';
import { loggerConfigRaw } from '@adapters/config-adapter';
import { LoggerModule } from '@libs/logger';
import * as pgPromise from 'pg-promise';

const config = databaseConfig();
const pgp = pgPromise();
const client = pgp({
  ssl: config.ssl,
  host: config.host,
  port: config.port,
  user: config.username,
  password: config.password,
  database: config.database,
});

const logger = LoggerModule.createLoggerByOptions({
  context: 'Migration',
  ...loggerConfigRaw,
});

const migrator = new Migrator(
  client,
  join(__dirname, '../migrations'),
  'migrations',
  logger,
);

const command = process.argv[2];

(async () => {
  switch (command) {
    case 'up':
      await migrator.migrateUp();
      break;
    case 'down':
      await migrator.migrateDown();
      break;
    default:
      console.log('Usage: ts-node cli.ts [up|down]');
  }
  process.exit();
})();
